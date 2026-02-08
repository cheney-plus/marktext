import { getCurrentWindow, Menu as RemoteMenu, MenuItem as RemoteMenuItem } from '@electron/remote'
import { createSideBarMenuItems } from './menuItems'
import store from '../../store'
import { translate } from '../../i18n'

export const showContextMenu = (event, hasPathCache) => {
  const t = key => translate(store.state.preferences.language, key)
  const {
    SEPARATOR,
    NEW_FILE,
    NEW_DIRECTORY,
    COPY,
    CUT,
    PASTE,
    RENAME,
    DELETE,
    SHOW_IN_FOLDER
  } = createSideBarMenuItems(t)
  const menu = new RemoteMenu()
  const win = getCurrentWindow()
  const CONTEXT_ITEMS = [
    NEW_FILE,
    NEW_DIRECTORY,
    SEPARATOR,
    COPY,
    CUT,
    PASTE,
    SEPARATOR,
    RENAME,
    DELETE,
    SEPARATOR,
    SHOW_IN_FOLDER
  ]

  PASTE.enabled = hasPathCache

  CONTEXT_ITEMS.forEach(item => {
    menu.append(new RemoteMenuItem(item))
  })
  menu.popup([{ window: win, x: event.clientX, y: event.clientY }])
}
