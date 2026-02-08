import GeneralIcon from '@/assets/icons/pref_general.svg'
import EditorIcon from '@/assets/icons/pref_editor.svg'
import MarkdownIcon from '@/assets/icons/pref_markdown.svg'
import ThemeIcon from '@/assets/icons/pref_theme.svg'
import ImageIcon from '@/assets/icons/pref_image.svg'
import SpellIcon from '@/assets/icons/pref_spellcheck.svg'
import KeyBindingIcon from '@/assets/icons/pref_key_binding.svg'

import preferences from '../../../main/preferences/schema'

const baseCategory = [{
  key: 'General',
  label: 'general',
  icon: GeneralIcon,
  path: '/preference/general'
}, {
  key: 'Editor',
  label: 'editor',
  icon: EditorIcon,
  path: '/preference/editor'
}, {
  key: 'Markdown',
  label: 'markdown',
  icon: MarkdownIcon,
  path: '/preference/markdown'
}, {
  key: 'Spellchecker',
  label: 'spelling',
  icon: SpellIcon,
  path: '/preference/spelling'
}, {
  key: 'Theme',
  label: 'theme',
  icon: ThemeIcon,
  path: '/preference/theme'
}, {
  key: 'Image',
  label: 'image',
  icon: ImageIcon,
  path: '/preference/image'
}, {
  key: 'Keybindings',
  label: 'keybindings',
  icon: KeyBindingIcon,
  path: '/preference/keybindings'
}]

export const getCategory = t => baseCategory.map(item => ({
  ...item,
  name: t(item.key)
}))

export const getSearchContent = t => {
  const category = getCategory(t)
  const categoryMap = new Map(baseCategory.map(item => [item.key, item.label]))
  return Object.keys(preferences).map(k => {
    const { description, enum: emums } = preferences[k]
    let [category, preference] = description.split('--')
    if (Array.isArray(emums)) {
      preference += ` ${t('optional values')}: ${emums.join(', ')}`
    }
    return {
      category: t(category),
      categoryLabel: categoryMap.get(category) || category.toLowerCase(),
      preference: t(preference)
    }
  })
    .filter(({ category: ca }) => category.some(c => c.name === ca))
}
