![The Mirror's Edge Archive Logo](https://static.cloudlark.de/img/mea-logo-white-bg-1.svg)

This is the web codebase for the Mirror's Edge Archive, a collection of fan projects and a front-end to a comprehensive archive about the Mirror's Edge franchise.

The archive consists of high-quality photos. wallpapers, concept art, videos (such as gameplay previews, trailers, and developer diaries), audio (such as SFX and music), developer presentations, fan-made maps, and other resources.

Due to legal limitations, the archive (accessible at [archive.mirrorsedgearchive.org](https://archive.mirrorsedgearchive.org/)) and other resources that are the property of EA DICE will not be published in this repository.

For more information on how to contribute to this project, please visit [mirrorsedgearchive.org/contribute/](https://www.mirrorsedgearchive.org/contribute)

### Supported by

We are testing cross-browser compatibility with [BrowserStack](https://www.browserstack.com/).

<img src="https://static.cloudlark.de/img/browserstack-logo-2.svg" width="200px">
<br></br>

# Build instructions

The Mirror's Edge Archive is built using plain HTML, CSS, and JavaScript. Templating features are powered by Nunjucks.
The build toolchain uses Gulp and a number of plugins to optimize embedded images. All dependencies can be installed by cloning this repository and executing the following command:

```sh
> git clone https://github.com/Sidewinder53/mirrorsedgearchive.git
> npm install
```

Run a local development webserver using the Gulp task `devServer`:

```sh
> gulp devServer
```

To build a production-ready version, run the Gulp task `buildProduction`:

```sh
> gulp buildProduction
```
