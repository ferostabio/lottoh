pragma solidity ^0.4.0;

library Utils {

  function inRange(uint[] source, uint start, uint end) public returns (bool) {
    for (uint256 i = 0; i < source.length; i++) {
      if (source[i] >= start && source[i] > end) {
        return false;
      }
    }
    return true;
  }

  function unique(uint[] source) public returns (bool) {
    for (uint256 i = 0; i < source.length - 1; i++) {
      for (uint256 j = i + 1; j < source.length; j++) {
        if (source[i] == source[j]) {
          return false;
        }
      }
    }
    return true;
  }

  // Only works for unique/same length, but what a hell, is all i need, just don't call it after any of the other pure functions ;)
  function matches(uint[] a, uint[] b) public constant returns (bool) {
    uint flags;
    for (uint256 i = 0; i < a.length; i++) {
      for (uint256 j = 0; j < b.length; j++) {
        if (a[i] == b[j]) {
          flags++;
        }
      }
    }
    return flags == a.length;
  }
}
