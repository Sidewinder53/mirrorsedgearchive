![The Mirror's Edge Archive Logo](https://static.cloudlark.de/img/mea-logo-white-bg-1.svg)
This is the web code base for the Mirror's Edge Archive, which is a collection of fan projects and front-end to a comprehensive archive about the Mirror's Edge franchise.

The archive consists of high-quality photos and wallpapers, concept art, videos (like gameplay previews, trailers and developers diaries), audio (like SFX and music), developer presentations and fan-made maps as well as other resources.

Due to legal limitations, the archive (which is accessible at [archive.mirrorsedgearchive.org](https://archive.mirrorsedgearchive.org/)) and other resources which are the property of EA DICE will not be published in this repository.

For more information on how to contribute to this project please visit [mirrorsedgearchive.org/contribute/](https://www.mirrorsedgearchive.org/contribute/)

### Supported by

We are testing cross-browser compatibility with [BrowserStack](https://www.browserstack.com/) and use Azure DevOps for CI/CD.

<img src="https://static.cloudlark.de/img/browserstack-logo-2.svg" width="200px">
<br></br>

# Build instructions

The Mirror's Edge Archive is built using plain HTML, CSS and JavaScript. Templating features are powered by nunjucks.
The build toolchain uses gulp and a number of plugins to optimize integrated images. All dependenices can be installed by cloning this repository and executing the following command:

```sh
> git clone https://github.com/Sidewinder53/mirrorsedgearchive.git
> npm install
```

Run a local development webserver using gulp-task `devServer`

```sh
> gulp devServer
```

To build a production-ready version, run gulp-task `buildProduction`

```sh
> gulp buildProduction
```
