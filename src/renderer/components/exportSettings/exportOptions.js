export const getPageSizeList = t => [
  {
    label: t('A3 (297mm x 420mm)'),
    value: 'A3'
  }, {
    label: t('A4 (210mm x 297mm)'),
    value: 'A4'
  }, {
    label: t('A5 (148mm x 210mm)'),
    value: 'A5'
  }, {
    label: t('US Legal (8.5" x 13")'),
    value: 'Legal'
  }, {
    label: t('US Letter (8.5" x 11")'),
    value: 'Letter'
  }, {
    label: t('Tabloid (17" x 11")'),
    value: 'Tabloid'
  }, {
    label: t('Custom'),
    value: 'custom'
  }
]

export const getHeaderFooterTypes = t => [
  {
    label: t('None'),
    value: 0
  }, {
    label: t('Single cell'),
    value: 1
  }, {
    label: t('Three cells'),
    value: 2
  }
]

export const getHeaderFooterStyles = t => [
  {
    label: t('Default'),
    value: 0
  }, {
    label: t('Simple'),
    value: 1
  }, {
    label: t('Styled'),
    value: 2
  }
]

export const getExportThemeList = t => [{
  label: t('Academic'),
  value: 'academic'
}, {
  label: t('GitHub (Default)'),
  value: 'default'
}, {
  label: t('Liber'),
  value: 'liber'
}]
