import * as commands from './commands';

export const HKSketchFusionExtension = {
  name: "Open Color",
  description: "",
  author: "Jan Krutisch, Florian Munz, Michael Schieben",
  authorEmail: "info@opencolor.tools",
  version: "1.4.3",
  identifier: "tools.opencolor.sketch.opencolor",
  menu: {
    "isRoot": false,
    "items": [
      "importAsDocumentColors",
      "exportDocumentColors",
      "identifyColor",
      {
        title: "Palettes",
        items: [
          "importAsArtboard",
          "exportFromArtboard",
          "linkArtboard",
          "editMapping"
        ]
      },
      {
        title: 'Help',
        items: ['showInfo', 'openApp']
      }
    ]
  },
  commands: {
    importAsDocumentColors: {
      name: 'Load Document Colors',
      shortcut: "",
      run: commands.importAsDocumentColors
    },
    exportDocumentColors: {
      name: 'Save Document Colors',
      shortcut: "",
      run: commands.exportDocumentColors
    },
    importAsArtboard: {
      name: 'Import Palette',
      shortcut: "",
      run: commands.importAsArtboard
    },
    exportFromArtboard: {
      name: 'Export Palette',
      shortcut: "",
      run: commands.exportFromArtboard
    },
    linkArtboard: {
      name: 'Link Artboard with Palette',
      shortcut: "",
      run: commands.linkArtboard
    },
    identifyColor: {
      name: 'Identify Colors',
      shortcut: "cmd+shift+1",
      run: commands.identifyColors
    },
    editMapping: {
      name: 'Edit Name',
      shortcut: "",
      run: commands.editMapping
    },
    showInfo: {
      name: 'About',
      shortcut: "",
      run: commands.showInfo
    },
    openApp: {
      name: 'Open Companion App',
      shortcut: "",
      run: commands.openApp
    }
  }
};
