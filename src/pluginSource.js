import * as commands from './commands'
import extensions from './extensions'

let _extensionCommands = {}
let _commandExtensions = {}
let _extensionMenus = []

// build menu and commands for extensions
Object.keys(extensions).forEach((extensionIdentifier) => {
  let extension = extensions[extensionIdentifier]

  let menu = Object.assign({}, extension.menu)
  let qualifiedMenuItems = []

  extension.menu.items.forEach((menuItemTitle) => {
      // get qualified command identifier
    let fullItemTitle = extension.identifier + menuItemTitle

      // add command with qualified name
    _extensionCommands[fullItemTitle] = extension.commands[menuItemTitle]

      // add to menu
    qualifiedMenuItems.push(fullItemTitle)
  })

  menu.items = qualifiedMenuItems

  _extensionMenus.push(menu)
})

export const HKSketchFusionExtension = {
  name: 'Open Color',
  bundleName: 'opencolortools',
  description: 'Use Open Color in Sketch',
  author: 'Jan Krutisch, Florian Munz, Michael Schieben',
  authorEmail: 'info@opencolor.tools',
  version: '1.8.6',
  identifier: 'tools.opencolor.sketch.opencolor',
  menu: {
    'isRoot': false,
    'items': [
      'EXT_MENUS',
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
          'importAsArtboard',
          'exportFromArtboard'
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
    importAsArtboard: {
      name: 'Import Palette',
      shortcut: '',
      run: commands.importAsArtboard
    },
    exportFromArtboard: {
      name: 'Export Palette',
      shortcut: '',
      run: commands.exportFromArtboard
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
    },
    'EXT_COMMANDS': null
  }
}

export const extensionCommands = _extensionCommands
export const extensionMenus = _extensionMenus
export const commandExtensions = _commandExtensions
