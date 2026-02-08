import { app, Menu } from 'electron'
import * as actions from '../actions/file'
import { getTranslator } from '../../i18n'

export default function (preferences) {
  const language = preferences.getItem('language') || preferences.getAll().language
  const t = getTranslator(language)
  return Menu.buildFromTemplate([{
    label: t('Open...'),
    click (menuItem, browserWindow) {
      if (browserWindow) {
        actions.openFile(browserWindow)
      } else {
        actions.newEditorWindow()
      }
    }
  }, {
    label: t('Clear Recent'),
    click () {
      app.clearRecentDocuments()
    }
  }])
}
