pragma solidity ^0.4.0;

import "./Utils.sol";
import "./Random.sol";

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";

contract Lottery is Ownable {

  using SafeMath for uint256;
  using Utils for uint[];
  using Random for Random;

  struct Ticket {
    uint[] numbers;
    uint time;
    uint value;
  }

  struct Result {
    uint[] numbers;
    address[] winners;
    uint time;
    uint value;
  }

  address owner;

  mapping (address => Ticket) public tickets;
  mapping (uint256 => address) public players;
  uint256 private numberOfPlayers;
  bool private open;

  uint256 start;

  address[] public currentWinners;
  Result[] previousWinners;

  event StatusChanged(bool open);
  event Play(address player, uint[] numbers);
  event End(address[] winners, uint[] winningNumbers, uint value);

  function Lottery() public {
    owner = msg.sender;
    playOn(now);
  }

  function isOpen() public view returns (bool) {
    return open;
  }

  function getNumberOfPlayers() public view returns (uint) {
    return numberOfPlayers;
  }

  function getBalance() public view returns (uint) {
    return this.balance;
  }

  function playOn(uint date) public onlyOwner {
    open = true;
    start = date;
    StatusChanged(open);
  }

  function playOff() public onlyOwner {
    open = false;
    StatusChanged(open);
  }

  function candidate(address player) public view returns (uint[]) {
    Ticket storage ticket = tickets[player];
    if (ticket.time > start) {
      return ticket.numbers;
    }
    return new uint[](0);
  }

  function play(uint[] numbers) public payable isValid(numbers) {
    //require(msg.sender != owner); <- Not much dev friendly
    require(msg.value > 0 && msg.sender.balance > msg.value);
    require(tickets[msg.sender].numbers.length == 0 || tickets[msg.sender].time < start);

    if (open) {
      tickets[msg.sender] = Ticket({numbers: numbers, time: now, value: msg.value});
      players[numberOfPlayers] = msg.sender;
      numberOfPlayers += 1;

      Play(msg.sender, numbers);
    }
  }

  function ownerGains() private view returns (uint) {
    return this.balance.mul(5).div(100);
  }

  function getPrize() public view returns (uint) {
    uint ownerGains = this.balance.mul(5).div(100);
    return this.balance - ownerGains;
  }

  function chooseWinners() public view onlyOwner returns (uint[]) {
    uint seed = uint(keccak256(block.timestamp))%1000 +1; // Lame as hell, see Random.sol's comment
    uint[] memory numbers = new uint[](size);
    uint numberOfWinningNumbers = 0;
    while (numberOfWinningNumbers < size) {
      uint x = Random.generate(seed, maxNumber);
      bool exists = false;
      for (uint i = 0; i < numberOfWinningNumbers; i++) {
        if (i == x) {
          exists = true;
        }
      }
      if (!exists) {
        numbers[i] = x;
        numberOfWinningNumbers += 1;
      }
      seed += 1;
    }
    return numbers;
  }

  function endLottohWithNumbers(uint[] winningNumbers) public onlyOwner isValid(winningNumbers) {
    if (!open) {
      uint meMoney = ownerGains();
      uint prize = this.balance - meMoney;

      uint time = now;
      uint numberOfWinners = markWinners(winningNumbers);

      address[] memory winners = new address[](numberOfWinners);
      if (numberOfWinners > 0) {
        uint moneyEach = prize.div(numberOfWinners);
        for (uint i = 0; i < numberOfWinners; i++) {
          winners[i] = currentWinners[i];
          currentWinners[i].transfer(moneyEach);
        }
        owner.transfer(meMoney);
      }

      End(winners, winningNumbers, prize);

      previousWinners.push(Result({winners: winners, time: time, value: prize, numbers: winningNumbers}));

      reset();
    }
  }

  function endLottoh() public onlyOwner {
    uint[] memory winningNumbers = chooseWinners(); // This method sucks, it can't get any more pseudo
    endLottohWithNumbers(winningNumbers);
  }

  function markWinners(uint[] winningNumbers) private onlyOwner returns (uint256) {
    uint position;
    for (uint256 i = 0; i < numberOfPlayers; i++) {
      address player = players[i];
      uint[] memory playerNumbers = tickets[player].numbers;
      if (winningNumbers.matches(playerNumbers)) {
        currentWinners.push(player);
        position++;
      }
    }
    return position;
  }

  function getLastResult() public returns (uint[], address[], uint) {
    require(previousWinners.length > 0);
    Result memory lastResult = previousWinners[previousWinners.length - 1];
    return (lastResult.numbers, lastResult.winners, lastResult.value);
  }

  function reset() private onlyOwner {
    numberOfPlayers = 0;
    delete currentWinners;
  }

  // Utils

  uint256 constant size = 6;
  uint256 constant minNumber = 0;
  uint256 constant maxNumber = 36;

  modifier isValid(uint[] source) {
    require(source.length == size);
    require(source.inRange(minNumber, maxNumber));
    require(source.unique());
    _;
  }
}
