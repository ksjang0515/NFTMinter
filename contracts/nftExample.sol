pragma solidity ^0.5.0;

import "./Admin.sol";

contract nftExample is Admin {
    bool blockBased;
    uint256 _blockNumber;
    uint256 _timestamp;
    uint256 _price;

    event Withdrawn();
    event Success(uint256 timestamp, uint256 blockNumber, uint256 amount);

    constructor() public {}

    function mint(uint256 amt) external payable {
        require(condition(), "Too early");
        require(msg.value == getPrice() * amt, "Insufficient klay sent");
        require(!isContract(msg.sender), "Contract detected");

        emit Success(block.timestamp, block.number, amt);
    }

    function condition() private view returns (bool) {
        if (getBlockBased()) return block.number >= getBlockNumber();
        else return block.timestamp >= getTimestamp();
    }

    function isContract(address addr) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function getBlockBased() public view returns (bool) {
        return blockBased;
    }

    function setBlockBased(bool flag) external onlyAdmin {
        blockBased = flag;
    }

    function setPrice(uint256 price) external onlyAdmin {
        _price = price;
    }

    function getPrice() public view returns (uint256) {
        return _price;
    }

    function setBlockNumber(uint256 blockNumber) external onlyAdmin {
        _blockNumber = blockNumber;
    }

    function getBlockNumber() public view returns (uint256) {
        return _blockNumber;
    }

    function setTimestamp(uint256 timestamp) external onlyAdmin {
        _timestamp = timestamp;
    }

    function getTimestamp() public view returns (uint256) {
        return _timestamp;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() external onlyAdmin {
        address payable addr = creator();
        uint256 balance = address(this).balance;

        addr.transfer(balance);
        emit Withdrawn();
    }

    function SUICIDE() external onlyAdmin {
        address payable addr = creator();
        selfdestruct(addr);
    }

    function() external payable {}
}
