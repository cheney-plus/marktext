export const getTitleBarStyleOptions = t => [{
  label: t('Custom'),
  value: 'custom'
}, {
  label: t('Native'),
  value: 'native'
}]

export const zoomOptions = [{
  label: '50.0%',
  value: 0.5
}, {
  label: '62.5%',
  value: 0.625
}, {
  label: '75.0%',
  value: 0.75
}, {
  label: '87.5%',
  value: 0.875
}, {
  label: '100.0%',
  value: 1.0
}, {
  label: '112.5%',
  value: 1.125
}, {
  label: '125.0%',
  value: 1.25
}, {
  label: '137.5%',
  value: 1.375
}, {
  label: '150.0%',
  value: 1.5
}, {
  label: '162.5%',
  value: 1.625
}, {
  label: '175.0%',
  value: 1.75
}, {
  label: '187.5%',
  value: 1.875
}, {
  label: '200.0%',
  value: 2.0
}]

export const getFileSortByOptions = t => [{
  label: t('Creation time'),
  value: 'created'
}, {
  label: t('Modification time'),
  value: 'modified'
}, {
  label: t('Title'),
  value: 'title'
}]

export const getLanguageOptions = t => [{
  label: t('English'),
  value: 'en'
}, {
  label: t('Chinese (Simplified)'),
  value: 'zh'
}]

export const getLlmProviderOptions = t => [{
  label: t('DeepSeek'),
  value: 'deepseek'
}, {
  label: t('Qwen'),
  value: 'qwen'
}, {
  label: t('Doubao'),
  value: 'doubao'
}, {
  label: t('Yuanbao'),
  value: 'yuanbao'
}]
