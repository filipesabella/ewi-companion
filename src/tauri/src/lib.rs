use std::{sync::Mutex, thread, time::Duration};

use midir::{MidiInput, MidiInputConnection};
use serde::Serialize;
use tauri::{ipc::Channel, AppHandle, Emitter, State};

const CLIENT_NAME: &str = "ewi-companion";

#[derive(Clone, PartialEq, Serialize)]
struct MidiDevice {
  id: String,
  label: String,
}

// Dropping the connection closes it, so replacing it disconnects the
// previously selected device.
#[derive(Default)]
struct Connection(Mutex<Option<MidiInputConnection<()>>>);

fn midi_input() -> Result<MidiInput, String> {
  MidiInput::new(CLIENT_NAME).map_err(|e| e.to_string())
}

fn list_inputs() -> Vec<MidiDevice> {
  midi_input()
    .map(|midi| {
      midi
        .ports()
        .iter()
        .filter_map(|port| {
          midi.port_name(port).ok().map(|label| MidiDevice {
            id: port.id(),
            label,
          })
        })
        .collect()
    })
    .unwrap_or_default()
}

// Some(Some(note)) for note on, Some(None) for note off, None for anything
// else. A note on with velocity 0 is a note off.
fn parse_note(message: &[u8]) -> Option<Option<u8>> {
  match message {
    [status, note, velocity] if status & 0xF0 == 0x90 && *velocity > 0 => {
      Some(Some(*note))
    }
    [status, _, _] if matches!(status & 0xF0, 0x80 | 0x90) => Some(None),
    _ => None,
  }
}

// midir has no hotplug notifications, so poll and emit whenever the list of
// inputs changes.
fn watch_inputs(app: AppHandle) {
  thread::spawn(move || {
    let mut last = Vec::new();
    loop {
      let current = list_inputs();
      if current != last {
        let _ = app.emit("midi-inputs", &current);
      }
      last = current;
      thread::sleep(Duration::from_secs(1));
    }
  });
}

#[tauri::command]
fn midi_inputs() -> Vec<MidiDevice> {
  list_inputs()
}

#[tauri::command]
fn midi_connect(
  id: String,
  on_note: Channel<Option<u8>>,
  connection: State<Connection>,
) -> Result<(), String> {
  let midi = midi_input()?;
  let port = midi.find_port_by_id(&id).ok_or("MIDI input not found")?;
  let new_connection = midi
    .connect(
      &port,
      CLIENT_NAME,
      move |_, message, _| {
        if let Some(note) = parse_note(message) {
          let _ = on_note.send(note);
        }
      },
      (),
    )
    .map_err(|e| e.to_string())?;

  *connection.0.lock().map_err(|e| e.to_string())? = Some(new_connection);
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(Connection::default())
    .invoke_handler(tauri::generate_handler![midi_inputs, midi_connect])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      watch_inputs(app.handle().clone());
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
