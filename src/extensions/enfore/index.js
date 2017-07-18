import * as commands from './commands'

export default {
  identifier: 'enfore',
  menu: {
    title: 'Enfore',
    items: [
      'tagLayer',
      'untagLayers',
      'selectLayersWithTag',
      'findAndReplaceTag',
      'toggleDuplicateIndicators',
      '-',
      'muteLayers',
      'unmuteLayers',
      'toggleMuteIndicators',
      '-',
      'updateLayerNames',
      'toggleSimplifiedLayerNames',
      '-',
      'showStats',
      'exportMapping',
      '-',
      'toggleWindow'
    ]
  },
  commands: {
    tagLayer: {
      name: 'Tag Layer',
      shortcut: '',
      run: commands.tagLayer
    },
    untagLayers: {
      name: 'Untag Layers',
      shortcut: '',
      run: commands.untagLayers
    },
    selectLayersWithTag: {
      name: 'Select Layers with Tag',
      shortcut: '',
      run: commands.selectLayersWithTag
    },
    findAndReplaceTag: {
      name: 'Find and Replace Tag',
      shortcut: '',
      run: commands.findAndReplaceTag
    },
    toggleDuplicateIndicators: {
      name: 'Toggle Duplicate Indicators',
      shortcut: '',
      run: commands.toggleDuplicateIndicators
    },
    muteLayers: {
      name: 'Mute Layers',
      shortcut: '',
      run: commands.muteLayers
    },
    unmuteLayers: {
      name: 'Unmute Layers',
      shortcut: '',
      run: commands.unmuteLayers
    },
    toggleMuteIndicators: {
      name: 'Toggle Mute Indicators',
      shortcut: '',
      run: commands.toggleMuteIndicators
    },
    updateLayerNames: {
      name: 'Update Layer Names',
      shortcut: '',
      run: commands.updateLayerNames
    },
    toggleSimplifiedLayerNames: {
      name: 'Toggle Simplified Layer Names',
      shortcut: '',
      run: commands.toggleSimplifiedLayerNames
    },
    showStats: {
      name: 'Show Stats',
      shortcut: '',
      run: commands.showStats
    },
    exportMapping: {
      name: 'Export mapping',
      shortcut: '',
      run: commands.exportMapping
    },
    toggleWindow: {
      name: 'Toggle Window',
      shortcut: '',
      run: commands.toggleWindow
    }
  }
}

export {default as commands} from './commands'
