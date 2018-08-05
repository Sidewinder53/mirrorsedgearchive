![The Mirror's Edge Archive Logo](https://puu.sh/B1GW8.svg")
This is the web code base for the Mirror's Edge Archive, which is a huge collection of high-quality photos, concept art, trailers, gameplay-videos, audio, music, developer presentations, fan projects, maps and other resources from the video game franchise Mirror's Edge.

For more information on how to contribute to this project please visit https://mirrorsedgearchive.de/contribute/

## Build instructions

The Mirror's Edge Archive is built using plain HTML, CSS and JavaScript. Some pages use Bootstrap, which is loaded from an external host.
For build automation we do use gulp and several gulp plugins. All dependenices can be installed by cloning this repository and executing the following command:

```sh
> npm install
```

Run a local development webserver (powered by [Browsersync](https://browsersync.io/)) using gulp-task `browser-sync`

```sh
> gulp
```

To build a production-ready version, run gulp-task `build-prod`

```sh
> gulp build-prod
```
