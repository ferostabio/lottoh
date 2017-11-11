var Utils = artifacts.require("./Utils.sol")

contract('Utils', accounts => {
  var utils
  var min = 0, max = 36
  var validNumbers = [1,2,3,4,5,6]
  var notUniqueNumbers = [1,1,2,3,4,5]
  var notInRangeNumbers = [-1,1,2,3,40]
  it("should accept valid uint[] arrays", () => {
    return Utils.new().then(instance => {
      utils = instance
      return utils.inRange.call(validNumbers, min, max)
    }).then(bool => {
      assert.equal(bool, true, "Valid numbers[] considered not in range")
      return utils.unique.call(validNumbers)
    }).then(bool => {
      assert.equal(bool, true, "Valid numbers[] considered as not unique")
      return utils.matches.call(validNumbers, [1,2,3,4,5,6])
    }).then(bool => {
      assert.equal(bool, true, "Equal numbers[] considered as different")
    })
  })

  it("should reject invalid uint[] arrays", () => {
    return Utils.new().then(instance => {
      utils = instance
      return utils.inRange.call(notInRangeNumbers, min, max)
    }).then(bool => {
      assert.equal(bool, false, "Invalid numbers[] considered as in range")
      return utils.unique.call(notUniqueNumbers)
    }).then(bool => {
      assert.equal(bool, false, "Invalid numbers[] considered as unique")
      return utils.matches.call(validNumbers, [1,2,3,4,5,8])
    }).then(bool => {
      assert.equal(bool, false, "Different numbers[] considered as equal")
    })
  })
})
