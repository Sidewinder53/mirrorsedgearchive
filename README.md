![The Mirror's Edge Archive Logo](https://static.cloudlark.de/img/mea-logo-1.svg)
This is the web code base for the Mirror's Edge Archive, which is a collection of fan projects and front-end to a comprehensive archive about the Mirror's Edge franchise.

The archive consists of high-quality photos and wallpapers, concept art, videos (like gameplay previews, trailers and developers diaries), audio (like SFX and music), developer presentations and fan-made maps as well as other resources.

Due to legal limitations, the archive (which is accessible at [archive.mirrorsedgearchive.de](https://archive.mirrorsedgearchive.de/)) and other resources which are the property of EA DICE will not be published in this repository.

For more information on how to contribute to this project please visit https://mirrorsedgearchive.de/contribute/

## Build instructions

The Mirror's Edge Archive is built using plain HTML, CSS and JavaScript. Some pages use Bootstrap, which is loaded from an external host.
The build toolchain has been built using gulp and numerous plugins. All dependenices can be installed by cloning this repository and executing the following command:

```sh
> git clone https://github.com/Sidewinder53/mirrorsedgearchive.git
> npm install
```

Run a local development webserver (powered by [Browsersync](https://browsersync.io/)) using gulp-task `browser-sync`

```sh
> gulp browser-sync
```

To build a production-ready version, run gulp-task `build-prod`

```sh
> gulp build-prod
```
