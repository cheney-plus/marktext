import * as actions from '../actions/paragraph'
import { getTranslator } from '../../i18n'

export default function (keybindings, preferences) {
  const language = preferences.getItem('language') || preferences.getAll().language
  const t = getTranslator(language)
  return {
    id: 'paragraphMenuEntry',
    label: t('&Paragraph'),
    submenu: [{
      id: 'heading1MenuItem',
      label: t('Heading 1'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.heading-1'),
      click (menuItem, focusedWindow) {
        actions.heading1(focusedWindow)
      }
    }, {
      id: 'heading2MenuItem',
      label: t('Heading 2'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.heading-2'),
      click (menuItem, focusedWindow) {
        actions.heading2(focusedWindow)
      }
    }, {
      id: 'heading3MenuItem',
      label: t('Heading 3'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.heading-3'),
      click (menuItem, focusedWindow) {
        actions.heading3(focusedWindow)
      }
    }, {
      id: 'heading4MenuItem',
      label: t('Heading 4'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.heading-4'),
      click (menuItem, focusedWindow) {
        actions.heading4(focusedWindow)
      }
    }, {
      id: 'heading5MenuItem',
      label: t('Heading 5'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.heading-5'),
      click (menuItem, focusedWindow) {
        actions.heading5(focusedWindow)
      }
    }, {
      id: 'heading6MenuItem',
      label: t('Heading 6'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.heading-6'),
      click (menuItem, focusedWindow) {
        actions.heading6(focusedWindow)
      }
    }, {
      type: 'separator'
    }, {
      id: 'upgradeHeadingMenuItem',
      label: t('Promote Heading'),
      accelerator: keybindings.getAccelerator('paragraph.upgrade-heading'),
      click (menuItem, focusedWindow) {
        actions.increaseHeading(focusedWindow)
      }
    }, {
      id: 'degradeHeadingMenuItem',
      label: t('Demote Heading'),
      accelerator: keybindings.getAccelerator('paragraph.degrade-heading'),
      click (menuItem, focusedWindow) {
        actions.degradeHeading(focusedWindow)
      }
    }, {
      type: 'separator'
    }, {
      id: 'tableMenuItem',
      label: t('Table'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.table'),
      click (menuItem, focusedWindow) {
        actions.table(focusedWindow)
      }
    }, {
      id: 'codeFencesMenuItem',
      label: t('Code Fences'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.code-fence'),
      click (menuItem, focusedWindow) {
        actions.codeFence(focusedWindow)
      }
    }, {
      id: 'quoteBlockMenuItem',
      label: t('Quote Block'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.quote-block'),
      click (menuItem, focusedWindow) {
        actions.quoteBlock(focusedWindow)
      }
    }, {
      id: 'mathBlockMenuItem',
      label: t('Math Block'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.math-formula'),
      click (menuItem, focusedWindow) {
        actions.mathFormula(focusedWindow)
      }
    }, {
      id: 'htmlBlockMenuItem',
      label: t('HTML Block'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.html-block'),
      click (menuItem, focusedWindow) {
        actions.htmlBlock(focusedWindow)
      }
    }, {
      type: 'separator'
    }, {
      id: 'orderListMenuItem',
      label: t('Ordered List'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.order-list'),
      click (menuItem, focusedWindow) {
        actions.orderedList(focusedWindow)
      }
    }, {
      id: 'bulletListMenuItem',
      label: t('Bullet List'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.bullet-list'),
      click (menuItem, focusedWindow) {
        actions.bulletList(focusedWindow)
      }
    }, {
      id: 'taskListMenuItem',
      label: t('Task List'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.task-list'),
      click (menuItem, focusedWindow) {
        actions.taskList(focusedWindow)
      }
    }, {
      type: 'separator'
    }, {
      id: 'looseListItemMenuItem',
      label: t('Loose List Item'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.loose-list-item'),
      click (menuItem, focusedWindow) {
        actions.looseListItem(focusedWindow)
      }
    }, {
      type: 'separator'
    }, {
      id: 'paragraphMenuItem',
      label: t('Paragraph'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.paragraph'),
      click (menuItem, focusedWindow) {
        actions.paragraph(focusedWindow)
      }
    }, {
      id: 'horizontalLineMenuItem',
      label: t('Horizontal Rule'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.horizontal-line'),
      click (menuItem, focusedWindow) {
        actions.horizontalLine(focusedWindow)
      }
    }, {
      id: 'frontMatterMenuItem',
      label: t('Front Matter'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('paragraph.front-matter'),
      click (menuItem, focusedWindow) {
        actions.frontMatter(focusedWindow)
      }
    }]
  }
}
