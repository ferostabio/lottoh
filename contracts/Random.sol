pragma solidity ^0.4.0;

library Random {

  // Pseudo random generation, taken from https://gist.github.com/alexvandesande/259b4ffb581493ec0a1c
  function generate(uint seed, uint limit) public constant returns (uint randomNumber) {
    return (uint(keccak256(block.blockhash(block.number-1), seed ))%limit);
  }
}
