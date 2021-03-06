![](http://opencolor.tools/images/fb-open-color-tools.png)

# Open Color Plugin for Sketch

Start working with meaningful colors in Sketch.

This plugin supports designers who want to use meaningful color palettes defined as .oco fields (open color file format).

[Learn more about Open Color Tools](http://opencolor.tools)

## Features

- [x] Import oco files as document colors
- [x] Save document colors as oco file
- [x] Identify Color Name (Fill, Border, Shadow)
- [x] Import oco files as swatches into artboard
- [x] Export an Artboard containing swatches as oco
- [x] Edit color names and colors inside sketch
- [x] Export oco files

--------------------------------------------------------------------------------

This plugin is open source. It is also shipped with Open Color Tools.

--------------------------------------------------------------------------------

## Usage

See [Manual](MANUAL.md)

## Development

This plugin is based on Sketch Fusion by [Andrey Shakhmin, @turbobabr](https://github.com/turbobabr), as presented at [#SketcHHackday 2016](http://designtoolshackday.com).

Development

```
npm install
gulp watch
```

To release a new version as github release, run:

```
export GITHUB_TOKEN=yoursecrettoken
gulp release
```
