import { getTranslator } from '../../i18n'

export default function (keybindings, preferences) {
  const language = preferences.getItem('language') || preferences.getAll().language
  const t = getTranslator(language)
  return {
    label: t('Edit'),
    submenu: [{
      label: t('Cut'),
      accelerator: keybindings.getAccelerator('edit.cut'),
      role: 'cut'
    }, {
      label: t('Copy'),
      accelerator: keybindings.getAccelerator('edit.copy'),
      role: 'copy'
    }, {
      label: t('Paste'),
      accelerator: keybindings.getAccelerator('edit.paste'),
      role: 'paste'
    }, {
      type: 'separator'
    }, {
      label: t('Select All'),
      accelerator: keybindings.getAccelerator('edit.select-all'),
      role: 'selectAll'
    }]
  }
}
