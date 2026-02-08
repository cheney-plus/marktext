import BaseFloat from '../baseFloat'
import { patch, h } from '../../parser/render/snabbdom'
import selection from '../../selection'
import icons from './config'
import aiContinueIcon from '../../assets/pngicon/ai/续写.png'
import aiShortenIcon from '../../assets/pngicon/ai/缩写.png'
import aiPolishIcon from '../../assets/pngicon/ai/润色.png'
import aiExpandIcon from '../../assets/pngicon/ai/扩写.png'
import aiChatIcon from '../../assets/pngicon/ai/ai对话.png'

import './index.css'

const defaultOptions = {
  placement: 'top',
  modifiers: {
    offset: {
      offset: '0, 5'
    }
  },
  showArrow: false
}

const AI_ICON_MAP = {
  continue: aiContinueIcon,
  shorten: aiShortenIcon,
  polish: aiPolishIcon,
  expand: aiExpandIcon,
  chat: aiChatIcon
}

class FormatPicker extends BaseFloat {
  static pluginName = 'formatPicker'

  constructor (muya, options = {}) {
    const name = 'ag-format-picker'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.oldVnode = null
    this.formats = null
    this.options = opts
    this.icons = icons
    this.aiItems = Array.isArray(opts.aiItems) ? opts.aiItems : []
    // 记录悬浮工具栏打开时的选区快照，避免点击工具栏后选区丢失
    this.aiSelectionText = ''
    // 记录悬浮工具栏打开时的选区游标，确保 AI 应用替换到正确位置
    this.aiSelectionCursor = null
    const formatContainer = this.formatContainer = document.createElement('div')
    this.container.appendChild(formatContainer)
    this.floatBox.classList.add('ag-format-picker-container')
    this.listen()
  }

  listen () {
    const { eventCenter } = this.muya
    super.listen()
    eventCenter.subscribe('muya-format-picker', ({ reference, formats }) => {
      if (reference) {
        this.formats = formats
        // 悬浮工具栏显示时捕获选区游标
        this.aiSelectionCursor = selection.getCursorRange()
        // 优先使用 Markdown 选区文本作为 AI 输入
        const clipboardData = this.muya.contentState.getClipBoardData()
        this.aiSelectionText = clipboardData && clipboardData.text ? clipboardData.text : this.getSelectionText()
        setTimeout(() => {
          this.show(reference)
          this.render()
        }, 0)
      } else {
        // 隐藏悬浮工具栏时清理选区快照
        this.aiSelectionText = ''
        this.aiSelectionCursor = null
        this.hide()
      }
    })
  }

  render () {
    const { icons, oldVnode, formatContainer, formats, aiItems } = this
    const children = icons.map(i => {
      let icon
      let iconWrapperSelector
      if (i.icon) {
        // SVG icon Asset
        iconWrapperSelector = 'div.icon-wrapper'
        icon = h('i.icon', h('i.icon-inner', {
          style: {
            background: `url(${i.icon}) no-repeat`,
            'background-size': '100%'
          }
        }, ''))
      }
      const iconWrapper = h(iconWrapperSelector, icon)

      let itemSelector = `li.item.${i.type}`
      if (formats.some(f => f.type === i.type || f.type === 'html_tag' && f.tag === i.type)) {
        itemSelector += '.active'
      }
      return h(itemSelector, {
        attrs: {
          title: `${i.tooltip} ${i.shortcut}`
        },
        on: {
          click: event => {
            this.selectItem(event, i)
          }
        }
      }, [iconWrapper])
    })

    const aiChildren = aiItems.map(item => {
      const nodes = []
      const icon = AI_ICON_MAP[item.action]
      if (icon) {
        nodes.push(h('i.ai-png-icon', {
          style: {
            background: `url(${icon}) no-repeat`,
            'background-size': '100%'
          }
        }, ''))
      }
      nodes.push(h('span.ai-label', item.label))
      return h('li.ai-item', {
        attrs: {
          title: item.title || item.label
        },
        on: {
          click: event => {
            this.selectAiItem(event, item)
          }
        }
      }, nodes)
    })

    const rows = [h('ul.tools-row', children)]
    if (aiChildren.length) {
      rows.push(h('ul.ai-row', aiChildren))
    }
    const vnode = h('div', rows)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(formatContainer, vnode)
    }
    this.oldVnode = vnode
  }

  selectItem (event, item) {
    event.preventDefault()
    event.stopPropagation()
    if (item.type === 'translate') {
      const text = this.aiSelectionText || this.getSelectionText()
      const cursor = this.aiSelectionCursor
      this.muya.eventCenter.dispatch('muya-ai-action', { action: 'translate', text, cursor })
      this.hide()
      return
    }
    const { contentState } = this.muya
    contentState.render()
    contentState.format(item.type)
    if (/link|image/.test(item.type)) {
      this.hide()
    } else {
      const { formats } = contentState.selectionFormats()
      this.formats = formats
      this.render()
    }
  }

  getSelectionText () {
    const selection = window.getSelection ? window.getSelection() : null
    return selection ? selection.toString() : ''
  }

  selectAiItem (event, item) {
    event.preventDefault()
    event.stopPropagation()
    // 使用缓存的选区快照，避免菜单点击导致选区变化
    const text = this.aiSelectionText || this.getSelectionText()
    const cursor = this.aiSelectionCursor
    this.muya.eventCenter.dispatch('muya-ai-action', { action: item.action, text, cursor })
    // 第二行 AI 菜单点击后关闭悬浮工具栏
    this.hide()
  }
}

export default FormatPicker
