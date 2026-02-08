import { getCurrentWindow, Menu as RemoteMenu, MenuItem as RemoteMenuItem } from '@electron/remote'
import { createTabMenuItems } from './menuItems'
import store from '../../store'
import { translate } from '../../i18n'

export const showContextMenu = (event, tab) => {
  const t = key => translate(store.state.preferences.language, key)
  const {
    CLOSE_THIS,
    CLOSE_OTHERS,
    CLOSE_SAVED,
    CLOSE_ALL,
    SEPARATOR,
    RENAME,
    COPY_PATH,
    SHOW_IN_FOLDER
  } = createTabMenuItems(t)
  const menu = new RemoteMenu()
  const win = getCurrentWindow()
  const { pathname } = tab
  const CONTEXT_ITEMS = [CLOSE_THIS, CLOSE_OTHERS, CLOSE_SAVED, CLOSE_ALL, SEPARATOR, RENAME, COPY_PATH, SHOW_IN_FOLDER]
  const FILE_CONTEXT_ITEMS = [RENAME, COPY_PATH, SHOW_IN_FOLDER]

  FILE_CONTEXT_ITEMS.forEach(item => {
    item.enabled = !!pathname
  })

  CONTEXT_ITEMS.forEach(item => {
    const menuItem = new RemoteMenuItem(item)
    menuItem._tabId = tab.id
    menu.append(menuItem)
  })
  menu.popup([{ window: win, x: event.clientX, y: event.clientY }])
}
