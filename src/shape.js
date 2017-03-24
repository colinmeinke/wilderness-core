// @todo abstract this to the svg-points lib
// and validate other properties
const validate = plainShapeObjects => plainShapeObjects.map(s => {
  if (typeof s.type === 'undefined') {
    throw new Error('type is a required property of a Plain Shape Object')
  }
})

const shape = (...plainShapeObjects) => {
  validate(plainShapeObjects)
}

export default shape
