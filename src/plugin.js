import * as commands from './commands'

export const HKSketchFusionExtension = {
  name: 'Open Color',
  bundleName: 'opencolortools',
  description: 'Use Open Color in Sketch',
  author: 'Jan Krutisch, Florian Munz, Michael Schieben, Lukas Ondrej',
  authorEmail: 'info@opencolor.tools',
  version: '1.9.1',
  identifier: 'tools.opencolor.sketch.opencolor',
  menu: {
    'isRoot': false,
    'items': [
      'linkArtboard',
      'setColor',
      'identifyColor',
      'swapColor',
      'swapTheme',
      'updateColors',
      {
        title: 'Identify',
        items: [
          'identifyAll',
          'identifyFill',
          'identifyBorder',
          'identifyText'
        ]
      },
      {
        title: 'Document',
        items: [
          'importAsDocumentColors',
          'exportDocumentColors'
        ]
      },
      {
        title: 'Composition',
        items: [
          'setMetadata',
          'importPalette',
          'exportPalette'
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
      shortcut: '',
      run: commands.importAsDocumentColors
    },
    exportDocumentColors: {
      name: 'Save Document Colors',
      shortcut: '',
      run: commands.exportDocumentColors
    },
    setMetadata: {
      name: 'Set Metadata',
      shortcut: '',
      run: commands.setMetadata
    },
    importPalette: {
      name: 'Import Palette',
      shortcut: '',
      run: commands.importPalette
    },
    exportPalette: {
      name: 'Export Palette',
      shortcut: '',
      run: commands.exportPalette
    },
    linkArtboard: {
      name: 'Link Artboard to Palette',
      shortcut: '',
      run: commands.linkArtboard
    },
    identifyAll: {
      name: 'Identify All Colors',
      shortcut: 'cmd+shift+2',
      run: commands.identifyAll
    },
    identifyFill: {
      name: 'Identify Fill Color',
      shortcut: '',
      run: commands.identifyFill
    },
    identifyBorder: {
      name: 'Identify Border Color',
      shortcut: '',
      run: commands.identifyBorder
    },
    identifyText: {
      name: 'Identify Text Color',
      shortcut: '',
      run: commands.identifyText
    },
    setColor: {
      name: 'Set Color',
      shortcut: 'cmd+shift+1',
      run: commands.setColor
    },
    updateColors: {
      name: 'Update Colors',
      shortcut: '',
      run: commands.updateColors
    },
    swapColor: {
      name: 'Swap Colors',
      shortcut: '',
      run: commands.swapColor
    },
    swapTheme: {
      name: 'Swap Theme',
      shortcut: '',
      run: commands.swapTheme
    },
    settings: {
      name: 'Settings',
      shortcut: '',
      run: commands.settings
    },
    showInfo: {
      name: 'About',
      shortcut: '',
      run: commands.showInfo
    },
    openApp: {
      name: 'Open Companion App',
      shortcut: '',
      run: commands.openApp
    }
  }
}
