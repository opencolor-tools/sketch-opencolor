import {openApp as doOpenApp, APP_BUNDLE_IDENTIFIER} from '../utils/oco-sketch';

export default function openApp(context) {
  if(!doOpenApp()) {
    context.document.showMessage('⛈ Could not start Open Color App');
  }
}
