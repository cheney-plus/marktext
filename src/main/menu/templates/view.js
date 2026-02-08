import * as actions from '../actions/view'
import { getTranslator } from '../../i18n'

export default function (keybindings, preferences) {
  const language = preferences.getItem('language') || preferences.getAll().language
  const t = getTranslator(language)
  const viewMenu = {
    label: t('&View'),
    submenu: [{
      label: t('Command Palette...'),
      accelerator: keybindings.getAccelerator('view.command-palette'),
      click (menuItem, focusedWindow) {
        actions.showCommandPalette(focusedWindow)
      }
    }, {
      type: 'separator'
    }, {
      id: 'sourceCodeModeMenuItem',
      label: t('Source Code Mode'),
      accelerator: keybindings.getAccelerator('view.source-code-mode'),
      type: 'checkbox',
      checked: false,
      click (item, focusedWindow) {
        actions.toggleSourceCodeMode(focusedWindow)
      }
    }, {
      id: 'typewriterModeMenuItem',
      label: t('Typewriter Mode'),
      accelerator: keybindings.getAccelerator('view.typewriter-mode'),
      type: 'checkbox',
      checked: false,
      click (item, focusedWindow) {
        actions.toggleTypewriterMode(focusedWindow)
      }
    }, {
      id: 'focusModeMenuItem',
      label: t('Focus Mode'),
      accelerator: keybindings.getAccelerator('view.focus-mode'),
      type: 'checkbox',
      checked: false,
      click (item, focusedWindow) {
        actions.toggleFocusMode(focusedWindow)
      }
    }, {
      type: 'separator'
    }, {
      label: t('Show Sidebar'),
      id: 'sideBarMenuItem',
      accelerator: keybindings.getAccelerator('view.toggle-sidebar'),
      type: 'checkbox',
      checked: false,
      click (item, focusedWindow) {
        actions.toggleSidebar(focusedWindow)
      }
    }, {
      label: t('Show Tab Bar'),
      id: 'tabBarMenuItem',
      accelerator: keybindings.getAccelerator('view.toggle-tabbar'),
      type: 'checkbox',
      checked: false,
      click (item, focusedWindow) {
        actions.toggleTabBar(focusedWindow)
      }
    }, {
      label: t('Toggle Table of Contents'),
      id: 'tocMenuItem',
      accelerator: keybindings.getAccelerator('view.toggle-toc'),
      click (_, focusedWindow) {
        actions.showTableOfContents(focusedWindow)
      }
    }, {
      label: t('Reload Images'),
      accelerator: keybindings.getAccelerator('view.reload-images'),
      click (item, focusedWindow) {
        actions.reloadImageCache(focusedWindow)
      }
    }]
  }

  if (global.MARKTEXT_DEBUG) {
    viewMenu.submenu.push({
      type: 'separator'
    })
    viewMenu.submenu.push({
      label: t('Show Developer Tools'),
      accelerator: keybindings.getAccelerator('view.toggle-dev-tools'),
      click (item, win) {
        actions.debugToggleDevTools(win)
      }
    })
    viewMenu.submenu.push({
      label: t('Reload window'),
      accelerator: keybindings.getAccelerator('view.dev-reload'),
      click (item, focusedWindow) {
        actions.debugReloadWindow(focusedWindow)
      }
    })
  }

  return viewMenu
}
