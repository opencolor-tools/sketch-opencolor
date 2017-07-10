import * as commands from './commands'

export default {
  identifier: 'nativeTest',
  menu: {
    title: 'Native Test',
    items: [
      'runNative'
    ]
  },
  commands: {
    runNative: {
      name: 'Run Native',
      shortcut: '',
      run: commands.runNative
    }
  }
}

export {default as commands} from './commands';
