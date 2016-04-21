![](http://opencolor.tools/images/fb-open-color-tools.png)

# Open Color Plugin for Sketch

Start working with meaningful colors in Sketch.

This plugin supports designers who want to meaningful color palettes defined in .oco fiels (open color file format).

[Learn more about Open Color Tools](http://opencolor.tools)

## Features

- [x] Import oco files as document colors
- [ ] Save document colors as oco file
- [x] Identify Color Name (Fill, Border, Shadow)
- [x] Import oco files as swatches into artboard
- [x] Edit color names and colors inside sketch
- [x] Export oco files

--------------------------------------------------------------------------------

This Plugin is developed open source. It will be shipped with Open Color Tools.

--------------------------------------------------------------------------------

## Development

This plugin is based on Sketch Fusion by [Andrey Shakhmin, @turbobabr](https://github.com/turbobabr) as presented at [#SketcHHackday 2016](http://designtoolshackday.com).

Development

```
npm install
gulp watch
```

To release new version as github release, run:

```
export GITHUB_TOKEN=yoursecrettoken
gulp release
```
