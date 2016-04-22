import * as commands from './commands';

export const HKSketchFusionExtension = {
  name: "🌈 Open Color Tools (Beta)",
  description: "",
  author: "Jan Krutisch, Florian Munz, Michael Schieben",
  authorEmail: "info@opencolor.tools",
  version: "1.4.0",
  identifier: "tools.opencolor.sketch.opencolor",
  menu: {
    "isRoot": false,
    "items": [
      "importAsDocumentColors",
      "exportDocumentColors",
      "importAsArtboard",
      "exportFromArtboard",
      "linkArtboard",
      "identifyColor",
      "editMapping",
      "showInfo",
      "openApp"
    ]
  },
  commands: {
    importAsDocumentColors: {
      name: 'Import as Document Colors',
      shortcut: "",
      run: commands.importAsDocumentColors
    },
    exportDocumentColors: {
      name: 'Export Document Colors',
      shortcut: "",
      run: commands.exportDocumentColors
    },
    importAsArtboard: {
      name: 'Import into Artboard',
      shortcut: "",
      run: commands.importAsArtboard
    },
    exportFromArtboard: {
      name: 'Export from Artboard',
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
      shortcut: "",
      run: commands.identifyColors
    },
    editMapping: {
      name: 'Edit Name <-> Color Mapping',
      shortcut: "",
      run: commands.editMapping
    },
    showInfo: {
      name: 'About Open Color Tools',
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
