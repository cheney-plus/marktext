import { ENCODING_NAME_MAP } from 'common/encoding'

export const tabSizeOptions = [{
  label: '1',
  value: 1
}, {
  label: '2',
  value: 2
}, {
  label: '3',
  value: 3
}, {
  label: '4',
  value: 4
}]

export const getEndOfLineOptions = t => [{
  label: t('Default'),
  value: 'default'
}, {
  label: t('Carriage return and line feed (CRLF)'),
  value: 'crlf'
}, {
  label: t('Line feed (LF)'),
  value: 'lf'
}]

export const getTrimTrailingNewlineOptions = t => [{
  label: t('Trim all trailing'),
  value: 0
}, {
  label: t('Ensure exactly one trailing'),
  value: 1
}, {
  label: t('Preserve style of original document'),
  value: 2
}, {
  label: t('Do nothing'),
  value: 3
}]

export const getTextDirectionOptions = t => [{
  label: t('Left to Right'),
  value: 'ltr'
}, {
  label: t('Right to Left'),
  value: 'rtl'
}]

export const getAiGeneratedMarkOptions = t => [{
  label: t('AI Mark None'),
  value: 'none'
}, {
  label: t('AI Mark Bold'),
  value: 'bold'
}, {
  label: t('AI Mark Highlight'),
  value: 'highlight'
}, {
  label: t('AI Mark Underline'),
  value: 'underline'
}, {
  label: t('AI Mark Italic'),
  value: 'italic'
}, {
  label: t('AI Mark Inline Formula'),
  value: 'inlineFormula'
}]

let defaultEncodingOptions = null
export const getDefaultEncodingOptions = () => {
  if (defaultEncodingOptions) {
    return defaultEncodingOptions
  }

  defaultEncodingOptions = []
  for (const [value, label] of Object.entries(ENCODING_NAME_MAP)) {
    defaultEncodingOptions.push({ label, value })
  }
  return defaultEncodingOptions
}
