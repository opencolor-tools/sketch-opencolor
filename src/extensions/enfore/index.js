import * as commands from './commands'

export default {
  identifier: 'enfore',
  menu: {
    title: 'Enfore',
    items: [
      'stats'
    ]
  },
  commands: {
    stats: {
      name: 'Stats',
      shortcut: '',
      run: commands.stats
    }
  }
}

export {default as commands} from './commands'
