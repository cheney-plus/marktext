export const themes = [
  {
    name: 'light'
  },
  {
    name: 'dark'
  },
  {
    name: 'graphite'
  },
  {
    name: 'material-dark'
  },
  {
    name: 'ulysses'
  },
  {
    name: 'one-dark'
  }
]

export const getAutoSwitchThemeOptions = t => [{
  label: t('Adjust theme at startup'),
  value: 0
}, {
  label: t('Never'),
  value: 2
}]
