import { parseEditorJsIntoHtmlStrings } from '@/index'
import { data } from './data'

describe('Parsing EditorJS data blocks', () => {
  test('Parsing data works', () => {
    const parsedData = parseEditorJsIntoHtmlStrings(data)
    console.log(parsedData)
    expect(parsedData.length).toBe(4)
  })
  test('Giving falsy blocks retuns an empty array', () => {
    //@ts-ignore
    const parsedData = parseEditorJsIntoHtmlStrings({})
    expect(parsedData.length).toBe(0)
  })
})
