# The Open Color Sketch Plugin Manual

This is a first attempt at documenting the current features of the Sketch Plugin.

## What you need to know first

The OCO Sketch Plugin currently doesn't make a lot of sense if you don't have the Open Color Companion App installed. You can get a free trial at [opencolor.tools](http://opencolor.tools).

## Link Artboard To Palette

This is a very essential function, but it's usefulness is not totally clear from the beginning. The idea behind many of the functions of this plugin is that you link an Artboard to one of your OCO palettes. Many of the following functions rely on this connection. It allows you to choose the Palette once and then assume that it is assigned.

If you select the menu item, the plugin will show you a list of all OCO palettes currently in your library. Select the one you want to use with the currently selected Artboard.

## Set Color

This command has two important functions: First, it allows you to set the color(s) of an element from the list of colors in your currently assigned OCO palette. Second, while doing so, it tags the element with the complete color name from your OCO palette.

Why is this important or useful? Imagine, you have an application design with lots of buttons. By assigning the border and fill colors of these buttons to color names in your OCO palette, you can change the colors in the OCO file and you can update the colors in the Sketch file automatically, without having to readjust all buttons in your file one by one.

So, imagine you have an OCO file that looks like this:

		Colors:
			Coral: #F96C55
			Egg Shell: #FFEFC1

		Primary Button:
			Background: =Colors.Coral
			Text: =Colors.Egg Shell

You can now tag your button elements with `Primary Button.Background` for the fill and `Primary Button.Text` for the text color and if you want to swap out, say, the background for all primary buttons in your design, you only need to change the OCO file you can use the "Update Colors" function described later to update all tagged button instances to the new color.

## Swap Colors

This function relies on the Set Color function as well. It allows you to replace any part of a color name (parts are separated by the . (dot)) with a new name. Let's imagine we've added a second button definition to our OCO palette:


		Secondary Button:
  			Background: =Colors.Tiffany Blue
  			Text: =Colors.Nice Blue 

You can now select a button, call the menu item and write "Primary Button" in the first field and "Secondary Button" in the second field.

## Swap Theme

This works very similar to the "Swap Colors" function but allows you to comfortably choose from a list of possible groups to replace. If you take the above OCO example and you have tagged a button with `Primary Button.Background` and `Primary Button.Text`as described above, selecting the plugin command will present you with a list of "Themes" you can switch to, which should be "Secondary Button" for this example.

Theme swapping applies to the selected elements and you can swap out all colors within an artboard if you select the artboard.

Since this is a very powerful function and, together with Set Color, not very intuitive, we've also created a video showing how to apply this to a number of usecases.

## Update Colors

If you have changed color values or color references in your OCO palette and you want these changes to be applied in your Sketch document as well, you can do so with Update Colors.

## Identify

These menu items give you a quick way to find out which colors you've used to tag your elements. Or, if you didn't tag the elements, but you've used colors from your OCO palette, it shows you the name(s) of the color(s) matching the element.

## Document

"Document Colors" is a section of swatches in the Sketch color picker that allows you to save this set of swatches with the document. The plugin commands allow you to load an OCO palette into the document colors and save your current document colors to an OCO file.

### Load Document Colors

This allows you to select one OCO palette in a drop down to import into your current document colors. All colors are replaced. Please note that if the color picker is open while you invoke the plugin command, the colors may not update immediately. close the picker and reopen it and your colors should be there.

### Save Document Colors

This allows you to save all current document colors as an OCO file you can then use to create more complex palettes. Simply choose a file name and the resulting palette will be written to your OCO library and will be available in the Open Color Companion instantly.

## Composition

To allow you to play with colors in Sketch and do your color composition in a graphical design tool instead of a text editor, the composition functions allow you to import OCO files as "swatches" in form of an Artboard with rectangular shapes with fill colors matching the OCO palette colors and also export an Artboard containing these swatches as an OCO file.

### Import Palette

Select one of your OCO palettes and the palette will be rendered into a new artboard.

### Export Palette

Select an Artboard, then select the plugin menu entry and then choose an OCO file name your colors should be exported to. Please note that while the export will honor sub groups in your artboard and create nested OCO palettes that way, both the Companion App and the color picker currently don't support palettes nested deeper than one level, so it's better to keep the structure flat in your "swatchboard".

		// OK!
		group:
			color: #fff

		// NOT OK!!
		group:
			subgroup:
				color: #fff

## Settings

Here you can set a default palette for the cases where you didn't link an artboard to a palette. This is a per document setting and is helpful if you're going to use one OCO palette for all artboards in your document.