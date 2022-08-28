# EWI-Companion
![EWI-Companion](https://user-images.githubusercontent.com/33415/187092315-ff656988-72b6-4055-bf65-9ca3358114c5.png)

A tool to practice the fingerings of the Akamai EWI 5000.

## How to use it

There's no installation process, simply go to: [filipesabella.com/ewi-companion](https://filipesabella.com/ewi-companion)

For the MIDI connection to work, you must use a browser that supports it, like Chrome/Edge/Safari (sadly, not Firefox).  
Then, connect your EWI to your computer using a [midi to usb cable](https://search.brave.com/images?q=midi+to+usb+cable), and you're good to go.

## Features

* Import MIDI files
* Write simple songs/scales by hand
* Click a particular fingering to select it from the others
* Bookmark a certain passage by clicking the empty bookmark icon on the progess bar. Navigate to it by either clicking or pressing the 1-9 keys
* Show a simplified music sheet with the current note, enable this in the settings screen

## Self-hosting

This is a client-side only application, and as such, you only need to host the static files.
Either build them yourself with `yarn build`, or download them from [here](https://github.com/filipesabella/ewi-companion/tree/build/docs).

## Development

```
yarn install
yarn dev
```
