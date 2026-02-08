import * as contextMenu from './actions'

export const createTabMenuItems = t => ({
  SEPARATOR: {
    type: 'separator'
  },
  CLOSE_THIS: {
    label: t('Close'),
    id: 'closeThisTab',
    click (menuItem, browserWindow) {
      contextMenu.closeThis(menuItem._tabId)
    }
  },
  CLOSE_OTHERS: {
    label: t('Close others'),
    id: 'closeOtherTabs',
    click (menuItem, browserWindow) {
      contextMenu.closeOthers(menuItem._tabId)
    }
  },
  CLOSE_SAVED: {
    label: t('Close saved tabs'),
    id: 'closeSavedTabs',
    click (menuItem, browserWindow) {
      contextMenu.closeSaved()
    }
  },
  CLOSE_ALL: {
    label: t('Close all tabs'),
    id: 'closeAllTabs',
    click (menuItem, browserWindow) {
      contextMenu.closeAll()
    }
  },
  RENAME: {
    label: t('Rename'),
    id: 'renameFile',
    click (menuItem, browserWindow) {
      contextMenu.rename(menuItem._tabId)
    }
  },
  COPY_PATH: {
    label: t('Copy path'),
    id: 'copyPath',
    click (menuItem, browserWindow) {
      contextMenu.copyPath(menuItem._tabId)
    }
  },
  SHOW_IN_FOLDER: {
    label: t('Show in folder'),
    id: 'showInFolder',
    click (menuItem, browserWindow) {
      contextMenu.showInFolder(menuItem._tabId)
    }
  }
})
