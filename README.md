# EWI-Companion
![EWI-Companion](https://user-images.githubusercontent.com/33415/187092315-ff656988-72b6-4055-bf65-9ca3358114c5.png)

A tool to practice the fingerings of the Akai EWI 5000.

## How to use it

Connect your EWI to your computer using a [midi to usb cable](https://search.brave.com/images?q=midi+to+usb+cable), then either use it in the browser or install the desktop app.

### In the browser

There's no installation process, simply go to: [filipesabella.com/ewi-companion](https://filipesabella.com/ewi-companion)

For the MIDI connection to work, you must use a browser that supports it, like Chrome/Edge/Safari (sadly, not Firefox).

### Desktop app

Download the installer for your system from the [latest release](https://github.com/filipesabella/ewi-companion/releases/latest):

* macOS: the `.dmg`, `aarch64` for Apple Silicon or `x64` for Intel
* Windows: the `.msi` or the `-setup.exe`
* Linux: the `.AppImage`, `.deb` or `.rpm`

The desktop app talks to MIDI devices directly, so it works regardless of browser support.

The apps aren't signed, so your system will complain the first time you open them:

* macOS says the app is damaged or can't be opened. Right-click it and choose Open, or run `xattr -cr "/Applications/EWI Companion.app"`
* Windows shows a SmartScreen warning. Click More info, then Run anyway

## Features

* Import MIDI files
* Write simple songs/scales by hand, or record them from your EWI
* Click a particular fingering to select it from the others
* Bookmark a note with the Bookmark button or the B key. Jump back to the start with 1, and to your bookmarks with 2-9
* Show a simplified music sheet with the current note, enable this in the settings screen

## Self-hosting

This is a client-side only application, and as such, you only need to host the static files.
Build them with `yarn build`, they end up in `.build/`.

## Development

```
yarn install
yarn start
```

Or, for the desktop app, which needs [Rust and the Tauri prerequisites](https://v2.tauri.app/start/prerequisites/):

```
yarn tauri:dev
```

## Releasing

* Web: every push to `master` deploys to GitHub Pages
* Desktop: bump `version` in `src/tauri/tauri.conf.json`, then push a matching tag, e.g. `git tag v1.1.0 && git push origin v1.1.0`. This builds the installers for every OS into a draft release, publish it once it's done
