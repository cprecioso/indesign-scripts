app.doScript(
  main,
  ScriptLanguage.JAVASCRIPT,
  undefined,
  UndoModes.ENTIRE_SCRIPT,
  "Add caption and wrap"
)

function main() {
  const document = app.activeDocument

  const selection = document.selection as PageItem[]

  if (selection.length === 0) return alert("No selection")

  for (const item of selection)
    if (!isPageItem(item)) return alert("Invalid selection")

  const firstItem = selection[0]

  const layer = firstItem.itemLayer

  let paragraphStyle: ParagraphStyle | undefined
  for (const currentParagraphStyle of document.allParagraphStyles)
    if (currentParagraphStyle.name === "Caption") {
      paragraphStyle = currentParagraphStyle
      break
    }
  if (!paragraphStyle) return alert("Can't find paragraph style 'Caption'")

  // 1. Disable wext wrap
  for (const item of selection)
    item.textWrapPreferences.textWrapMode = TextWrapModes.NONE

  // 2. Create caption text frame
  const newTextFrame = document.textFrames.add(
    layer,
    LocationOptions.AFTER,
    firstItem
  )

  newTextFrame.textFramePreferences.autoSizingReferencePoint =
    AutoSizingReferenceEnum.TOP_LEFT_POINT
  newTextFrame.textFramePreferences.autoSizingType =
    AutoSizingTypeEnum.HEIGHT_ONLY

  let [
    ,
    selectionLeft,
    selectionBottom,
    selectionRight
  ] = firstItem.geometricBounds as number[]

  for (const item of selection) {
    const [, itemLeft, itemBottom, itemRight] = item.geometricBounds as number[]
    if (itemLeft < selectionLeft) selectionLeft = itemLeft
    if (itemBottom > selectionBottom) selectionBottom = itemBottom
    if (itemRight > selectionRight) selectionRight = itemRight
  }

  newTextFrame.geometricBounds = [
    selectionBottom,
    selectionLeft,
    selectionBottom + 10,
    selectionRight
  ]
  const story = newTextFrame.parentStory
  story.contents = "Caption"
  const newParagraph = story.paragraphs.firstItem()
  newParagraph.applyParagraphStyle(paragraphStyle, true)
  newParagraph.contents = "Caption"

  // 3. Merge in group
  const newGroup = document.groups.add([...selection, newTextFrame], layer)

  // 4. Wrap group
  newGroup.textWrapPreferences.textWrapMode =
    TextWrapModes.BOUNDING_BOX_TEXT_WRAP
  newGroup.textWrapPreferences.textWrapOffset = [5, 5, 5, 5]
}

type ConcretePageItem =
  | EPSText
  | FormField
  | Graphic
  | GraphicLine
  | Group
  | HtmlItem
  | MediaItem
  | Oval
  | Polygon
  | Rectangle
  | TextFrame

function isPageItem(v: any): v is ConcretePageItem {
  return (
    v instanceof EPSText ||
    v instanceof FormField ||
    v instanceof Graphic ||
    v instanceof GraphicLine ||
    v instanceof Group ||
    v instanceof HtmlItem ||
    v instanceof MediaItem ||
    v instanceof Oval ||
    v instanceof Polygon ||
    v instanceof Rectangle ||
    v instanceof TextFrame
  )
}
