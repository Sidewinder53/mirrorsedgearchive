![The Mirror's Edge Archive Logo](https://static.cloudlark.de/img/mea-logo-1.svg)
This is the web code base for the Mirror's Edge Archive, which is a collection of fan projects and front-end to a comprehensive archive about the Mirror's Edge franchise.

The archive consists of high-quality photos and wallpapers, concept art, videos (like gameplay previews, trailers and developers diaries), audio (like SFX and music), developer presentations and fan-made maps as well as other resources.

Due to legal limitations, the archive (which is accessible at [archive.mirrorsedgearchive.de](https://archive.mirrorsedgearchive.de/)) and other resources which are the property of EA DICE will not be published in this repository.

For more information on how to contribute to this project please visit [mirrorsedgearchive.de/contribute/](https://mirrorsedgearchive.de/contribute/)

We are testing cross-browser compatibility with [BrowserStack](https://www.browserstack.com/)

<img src="https://static.cloudlark.de/img/browserstack-logo-1.svg" width="200px">

## Build instructions

Build pipeline & release automation by [Azure DevOps](https://dev.azure.com/cloudlark/mirrorsedgearchive).

<img src="https://vsrm.dev.azure.com/cloudlark/_apis/public/Release/badge/70dbfa67-3af7-4823-97b8-a474e59f0749/1/1"> <img src="https://dev.azure.com/cloudlark/mirrorsedgearchive/_apis/build/status/Sidewinder53.mirrorsedgearchive?branchName=master">

The Mirror's Edge Archive is built using plain HTML, CSS and JavaScript. Some pages use Bootstrap, which is loaded from an external host.
The build toolchain has been built using gulp and numerous plugins. All dependenices can be installed by cloning this repository and executing the following command:

```sh
> git clone https://github.com/Sidewinder53/mirrorsedgearchive.git
> npm install
```

Run a local development webserver using gulp-task `browser-sync`

```sh
> gulp browser-sync
```

To build a production-ready version, run gulp-task `build-prod`

```sh
> gulp build-prod
```
