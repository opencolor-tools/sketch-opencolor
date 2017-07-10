import * as commands from './commands'

export default {
  identifier: 'enfore',
  menu: {
    title: 'Enfore',
    items: [
      'example'
    ]
  },
  commands: {
    example: {
      name: 'Example',
      shortcut: '',
      run: commands.example
    }
  }
}

export {default as commands} from './commands'
