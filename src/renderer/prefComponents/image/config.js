export const getImageActions = t => [{
  label: t('Upload image to cloud using selected uploader (must be configured below)'),
  value: 'upload'
}, {
  label: t('Copy image to designated relative assets or global local folder'),
  value: 'folder'
}, {
  label: t('Keep original location'),
  value: 'path'
}]
