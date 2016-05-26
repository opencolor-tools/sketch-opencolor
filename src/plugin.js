import * as commands from './commands';

export const HKSketchFusionExtension = {
  name: "Open Color",
  description: "",
  author: "Jan Krutisch, Florian Munz, Michael Schieben",
  authorEmail: "info@opencolor.tools",
  version: "1.6.0",
  identifier: "tools.opencolor.sketch.opencolor",
  menu: {
    "isRoot": false,
    "items": [
      'linkArtboard',
      'linkColor',
      'updateLinkedColors',
      'updateLinks',
      'identifyColor',
      {
        title: "Identify",
        items: [
          "identifyAll",
          "identifyFill",
          "identifyBorder",
          "identifyText"
        ]
      },
      {
        title: "Document",
        items: [
          "importAsDocumentColors",
          "exportDocumentColors"
        ]
      },
      {
        title: "Composition",
        items: [
          "importAsArtboard",
          "exportFromArtboard"
        ]
      },
      'settings',
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
      name: 'Link Artboard to Palette',
      shortcut: "",
      run: commands.linkArtboard
    },
    identifyAll: {
      name: 'Identify All Colors',
      shortcut: "cmd+shift+1",
      run: commands.identifyAll
    },
    identifyFill: {
      name: 'Identify Fill Color',
      shortcut: "",
      run: commands.identifyFill
    },
    identifyBorder: {
      name: 'Identify Border Color',
      shortcut: "",
      run: commands.identifyBorder
    },
    identifyText: {
      name: 'Identify Text Color',
      shortcut: "",
      run: commands.identifyText
    },
    linkColor: {
      name: 'Link Color',
      shortcut: "",
      run: commands.linkColor
    },
    updateLinkedColors: {
      name: 'Update Linked Color',
      shortcut: "",
      run: commands.updateLinkedColors
    },
    updateLinks: {
      name: 'Update Links',
      shortcut: "",
      run: commands.updateLinks
    },
    settings: {
      name: 'Settings',
      shortcut: "",
      run: commands.settings
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
