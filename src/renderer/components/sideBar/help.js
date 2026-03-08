import FilesIcon from '@/assets/icons/files.svg'
import SearchIcon from '@/assets/icons/search.svg'
import TocIcon from '@/assets/icons/toc.svg'
import SettingIcon from '@/assets/icons/setting.svg'
import AiIcon from '../../../../static/ai.png'

export const sideBarIcons = [
  {
    name: 'files',
    icon: FilesIcon
  }, {
    name: 'search',
    icon: SearchIcon
  }, {
    name: 'toc',
    icon: TocIcon
  }
]

export const sideBarBottomIcons = [
  {
    name: 'ai-chat',
    icon: AiIcon,
    iconType: 'img'
  },
  {
    name: 'settings',
    icon: SettingIcon
  }
]
