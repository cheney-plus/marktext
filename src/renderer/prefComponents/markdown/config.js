export const bulletListMarkerOptions = [{
  label: '*',
  value: '*'
}, {
  label: '-',
  value: '-'
}, {
  label: '+',
  value: '+'
}]

export const orderListDelimiterOptions = [{
  label: '.',
  value: '.'
}, {
  label: ')',
  value: ')'
}]

export const getPreferHeadingStyleOptions = t => [{
  label: t('ATX heading'),
  value: 'atx'
}, {
  label: t('Setext heading'),
  value: 'setext'
}]

export const getListIndentationOptions = t => [{
  label: t('DocFX style'),
  value: 'dfm'
}, {
  label: t('True tab character'),
  value: 'tab'
}, {
  label: t('Single space character'),
  value: 1
}, {
  label: t('Two space characters'),
  value: 2
}, {
  label: t('Three space characters'),
  value: 3
}, {
  label: t('Four space characters'),
  value: 4
}]

export const getFrontmatterTypeOptions = t => [{
  label: t('YAML'),
  value: '-'
}, {
  label: t('TOML'),
  value: '+'
}, {
  label: t('JSON (;;;)'),
  value: ';'
}, {
  label: t('JSON ({})'),
  value: '{'
}]

export const getSequenceThemeOptions = t => [{
  label: t('Hand drawn'),
  value: 'hand'
}, {
  label: t('Simple'),
  value: 'simple'
}]
