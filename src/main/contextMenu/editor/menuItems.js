// NOTE: This are mutable fields that may change at runtime.

export const createMenuItems = t => ({
  CUT: {
    label: t('Cut'),
    id: 'cutMenuItem',
    role: 'cut'
  },
  COPY: {
    label: t('Copy'),
    id: 'copyMenuItem',
    role: 'copy'
  },
  PASTE: {
    label: t('Paste'),
    id: 'pasteMenuItem',
    role: 'paste'
  },
  COPY_AS_MARKDOWN: {
    label: t('Copy As Markdown'),
    id: 'copyAsMarkdownMenuItem',
    click (menuItem, targetWindow) {
      targetWindow.webContents.send('mt::cm-copy-as-markdown')
    }
  },
  COPY_AS_HTML: {
    label: t('Copy As Html'),
    id: 'copyAsHtmlMenuItem',
    click (menuItem, targetWindow) {
      targetWindow.webContents.send('mt::cm-copy-as-html')
    }
  },
  PASTE_AS_PLAIN_TEXT: {
    label: t('Paste as Plain Text'),
    id: 'pasteAsPlainTextMenuItem',
    click (menuItem, targetWindow) {
      targetWindow.webContents.send('mt::cm-paste-as-plain-text')
    }
  },
  INSERT_BEFORE: {
    label: t('Insert Paragraph Before'),
    id: 'insertParagraphBeforeMenuItem',
    click (menuItem, targetWindow) {
      targetWindow.webContents.send('mt::cm-insert-paragraph', 'before')
    }
  },
  INSERT_AFTER: {
    label: t('Insert Paragraph After'),
    id: 'insertParagraphAfterMenuItem',
    click (menuItem, targetWindow) {
      targetWindow.webContents.send('mt::cm-insert-paragraph', 'after')
    }
  },
  SEPARATOR: {
    type: 'separator'
  }
})

export const createAiMenuItems = (t, selectionText) => ({
  AI_GROUP: {
    label: t('AI'),
    submenu: [
      {
        label: t('Continue Writing'),
        id: 'aiContinueMenuItem',
        click (menuItem, targetWindow) {
          targetWindow.webContents.send('mt::cm-ai', { action: 'continue', text: selectionText })
        }
      },
      {
        label: t('Polish'),
        id: 'aiPolishMenuItem',
        click (menuItem, targetWindow) {
          targetWindow.webContents.send('mt::cm-ai', { action: 'polish', text: selectionText })
        }
      },
      {
        label: t('Shorten'),
        id: 'aiShortenMenuItem',
        click (menuItem, targetWindow) {
          targetWindow.webContents.send('mt::cm-ai', { action: 'shorten', text: selectionText })
        }
      },
      {
        label: t('Expand'),
        id: 'aiExpandMenuItem',
        click (menuItem, targetWindow) {
          targetWindow.webContents.send('mt::cm-ai', { action: 'expand', text: selectionText })
        }
      },
      {
        label: t('Chat'),
        id: 'aiChatMenuItem',
        click (menuItem, targetWindow) {
          targetWindow.webContents.send('mt::cm-ai', { action: 'chat', text: selectionText })
        }
      }
    ]
  }
})
