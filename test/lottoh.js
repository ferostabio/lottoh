var Lottery = artifacts.require("./Lottery.sol")
var BigNumber = require('bignumber.js');

contract('Lottoh', accounts => {
  var player = accounts[0]
  var playableNumbers = [1,2,3,4,5,6]
  var ether = web3.toWei('1')

  it("should be playable after deploying", () => {
    var lottery
    return Lottery.new().then(instance => {
      lottery = instance
      return instance.isOpen.call()
    }).then(open => {

      assert.isOk(open, "Contract not playable at start")
    })
  })

  it("should update balance and properties after a user plays", () => {
    var lottery
    return Lottery.new().then(instance => {
      lottery = instance
      return lottery.play(playableNumbers, {value: ether , from: player})
    }).then(() => {
      return lottery.getBalance.call()
    }).then(balance => {
      assert.equal(balance.valueOf(), ether , ether + " wasn't sent to the contract")
      return lottery.getNumberOfPlayers.call()
    }).then(numberOfPlayers => {
      assert.equal(numberOfPlayers.toNumber(), 1, "Wrong number of players variable")
      return lottery.players.call(0)
    }).then(element => {
      assert.equal(element, player, "Wrong element inside players variable")
      return lottery.tickets.call(player)
    }).then(ticket => {
      assert.notEqual(ticket, undefined, "Undefined ticket")
      assert.equal(ticket["1"], ether, "Wrong value added to ticket")
    })
  })

  it("user shouldn't be able to play after status has changed to closed", () => {
    var lottery
    return Lottery.new().then(instance => {
      lottery = instance
      return lottery.playOff()
    }).then(() => {
      return lottery.isOpen.call()
    }).then(open => {
      assert.isNotOk(open, "Play was valid after calling playOff")
      return lottery.play(playableNumbers, {value: ether , from: player})
    }).then(() => {
      return lottery.getNumberOfPlayers.call()
    }).then(numberOfPlayers => {
      assert.equal(numberOfPlayers, 0, "Wrong number of players variable")
    })
  })

  it("should find a valid winner if exists, balances should update and reset... resets", () => {
    var lottery
    return Lottery.new().then(instance => {
      lottery = instance
      return lottery.play(playableNumbers, {value: ether , from: accounts[1]})
    }).then(() => {
      return lottery.play([1,2,3,4,5,7], {value: ether , from: accounts[0]})
    }).then(() => {
      return lottery.playOff()
    }).then(() => {
      return lottery.endLottohWithNumbers(playableNumbers)
    }).then(() => {
      return lottery.getLastResult.call()
    }).then(tuple => {
      for (i = 0; i < playableNumbers.length; i++) {
        assert.equal(playableNumbers[i], tuple[0][i].toNumber(), "Wrong number");
      }
      assert.equal(tuple[1][0], accounts[1], "Not right winner?")
      return lottery.getNumberOfPlayers.call()
    }).then(numberOfPlayers => {
      assert.equal(numberOfPlayers, 0, "Reset didn't work, number of players not 0")
      return lottery.getBalance.call()
    }).then(balance => {
      assert.equal(balance, 0, "Balance not 0")
    })
  })

  it("should not choose winners if no match found", () => {
    var lottery
    return Lottery.new().then(instance => {
      lottery = instance
      return lottery.play(playableNumbers, {value: ether , from: player})
    }).then(() => {
      return lottery.playOff()
    }).then(() => {
      return lottery.endLottohWithNumbers([1,2,3,4,5,7])
    }).then(() => {
      return lottery.getNumberOfPlayers.call()
    }).then(numberOfPlayers => {
      assert.equal(numberOfPlayers.toNumber(), 0, "Wrong number of players variable") // Above i do the same and toNumber() ain't needed
      return lottery.getBalance.call()
    }).then(balance => {
      assert.notEqual(balance, 0, "Balance resetted to 0")
    })
  })
})
