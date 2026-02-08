// NOTE: This are mutable fields that may change at runtime.

import fs from 'fs'
import path from 'path'
import { app, nativeImage } from 'electron'

const resolveAiIconPath = filename => {
  const appPath = app.getAppPath()
  const candidates = [
    path.join(appPath, 'src/muya/lib/assets/pngicon/ai', filename),
    path.join(appPath, 'dist/renderer/muya/lib/assets/pngicon/ai', filename),
    path.join(appPath, 'dist/electron/renderer/muya/lib/assets/pngicon/ai', filename),
    path.resolve(__dirname, '../../../muya/lib/assets/pngicon/ai', filename)
  ]
  const found = candidates.find(item => fs.existsSync(item))
  return found || candidates[candidates.length - 1]
}

const createAiIcon = filename => {
  const image = nativeImage.createFromPath(resolveAiIconPath(filename))
  return image.isEmpty() ? image : image.resize({ width: 16, height: 16 })
}

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

export const createAiMenuItems = (t, selectionText, { hasText } = {}) => {
  const safeText = selectionText || ''
  const chatItem = {
    label: t('Chat'),
    id: 'aiChatMenuItem',
    icon: createAiIcon('ai对话.png'),
    click (menuItem, targetWindow) {
      targetWindow.webContents.send('mt::cm-ai', { action: 'chat', text: safeText })
    }
  }
  const fullItems = [
    {
      label: t('Continue Writing'),
      id: 'aiContinueMenuItem',
      icon: createAiIcon('续写.png'),
      click (menuItem, targetWindow) {
        targetWindow.webContents.send('mt::cm-ai', { action: 'continue', text: safeText })
      }
    },
    {
      label: t('Polish'),
      id: 'aiPolishMenuItem',
      icon: createAiIcon('润色.png'),
      click (menuItem, targetWindow) {
        targetWindow.webContents.send('mt::cm-ai', { action: 'polish', text: safeText })
      }
    },
    {
      label: t('Shorten'),
      id: 'aiShortenMenuItem',
      icon: createAiIcon('缩写.png'),
      click (menuItem, targetWindow) {
        targetWindow.webContents.send('mt::cm-ai', { action: 'shorten', text: safeText })
      }
    },
    {
      label: t('Expand'),
      id: 'aiExpandMenuItem',
      icon: createAiIcon('扩写.png'),
      click (menuItem, targetWindow) {
        targetWindow.webContents.send('mt::cm-ai', { action: 'expand', text: safeText })
      }
    },
    chatItem
  ]
  const submenu = hasText ? fullItems : [chatItem]
  return {
    AI_GROUP: {
      label: t('AI'),
      submenu
    }
  }
}
