var Lottery = artifacts.require("./Lottery.sol")
var Random = artifacts.require("./Random.sol")
var Utils = artifacts.require("./Utils.sol")

module.exports = deployer => {
  deployer.deploy(Random)
  deployer.deploy(Utils)
  deployer.link(Random, Lottery)
  deployer.link(Utils, Lottoh)
  deployer.deploy(Lottoh)
};
