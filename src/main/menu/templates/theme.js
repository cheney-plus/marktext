import * as actions from '../actions/theme'
import { getTranslator } from '../../i18n'

export default function (userPreference) {
  const language = userPreference.getItem('language') || userPreference.getAll().language
  const t = getTranslator(language)
  const { theme } = userPreference.getAll()
  return {
    label: t('&Theme'),
    id: 'themeMenu',
    submenu: [{
      label: t('Cadmium Light'),
      type: 'radio',
      id: 'light',
      checked: theme === 'light',
      click (menuItem, browserWindow) {
        actions.selectTheme('light')
      }
    }, {
      label: t('Dark'),
      type: 'radio',
      id: 'dark',
      checked: theme === 'dark',
      click (menuItem, browserWindow) {
        actions.selectTheme('dark')
      }
    }, {
      label: t('Graphite Light'),
      type: 'radio',
      id: 'graphite',
      checked: theme === 'graphite',
      click (menuItem, browserWindow) {
        actions.selectTheme('graphite')
      }
    }, {
      label: t('Material Dark'),
      type: 'radio',
      id: 'material-dark',
      checked: theme === 'material-dark',
      click (menuItem, browserWindow) {
        actions.selectTheme('material-dark')
      }
    }, {
      label: t('One Dark'),
      type: 'radio',
      id: 'one-dark',
      checked: theme === 'one-dark',
      click (menuItem, browserWindow) {
        actions.selectTheme('one-dark')
      }
    }, {
      label: t('Ulysses Light'),
      type: 'radio',
      id: 'ulysses',
      checked: theme === 'ulysses',
      click (menuItem, browserWindow) {
        actions.selectTheme('ulysses')
      }
    }]
  }
}
