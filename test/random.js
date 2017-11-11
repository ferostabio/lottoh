var Random = artifacts.require("./Random.sol")

contract('Random', accounts => {
  var random
  var seed = 0
  var limit = 36
  var firstNumber
  it("should generate pseudorandom numbers with a seed", () => {
    return Random.new().then(instance => {
      random = instance
      return random.generate.call(seed, limit)
    }).then(number => {
      assert.isAtLeast(number, 0, "Number less than 0, wtf")
      assert.isAtMost(number, limit, "Number beyond limit")
      firstNumber = number
      seed++
      return random.generate.call(seed, limit)
    }).then(number => {
      assert.equal(number.toFloat, firstNumber.toFloat, "Different number with same seed"); // Why is toFloat needed here!?
      seed++
      return random.generate.call(seed, limit)
    }).then(number => {
      assert.notEqual(number, firstNumber, "Equal numbers with different seeds")
    })
  })
})
