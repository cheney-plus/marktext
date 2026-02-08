import * as contextMenu from './actions'

export const createSideBarMenuItems = t => ({
  SEPARATOR: {
    type: 'separator'
  },
  NEW_FILE: {
    label: t('New File'),
    id: 'newFileMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.newFile()
    }
  },
  NEW_DIRECTORY: {
    label: t('New Directory'),
    id: 'newDirectoryMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.newDirectory()
    }
  },
  COPY: {
    label: t('Copy'),
    id: 'copyMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.copy()
    }
  },
  CUT: {
    label: t('Cut'),
    id: 'cutMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.cut()
    }
  },
  PASTE: {
    label: t('Paste'),
    id: 'pasteMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.paste()
    }
  },
  RENAME: {
    label: t('Rename'),
    id: 'renameMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.rename()
    }
  },
  DELETE: {
    label: t('Move To Trash'),
    id: 'deleteMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.remove()
    }
  },
  SHOW_IN_FOLDER: {
    label: t('Show In Folder'),
    id: 'showInFolderMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.showInFolder()
    }
  }
})
