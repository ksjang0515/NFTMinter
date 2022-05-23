pragma solidity ^0.5.0;

import "./Admin.sol";
import "./Minter.sol";

contract Controller is Admin {
    Minter[] minters;

    uint256 klayToPeb = 1000000000000000000;

    event Deposit(uint256 amount);
    event Withdrawal(uint256 amount);
    event Minted();

    constructor() public payable {}

    function mintTime(
        uint256 timestamp,
        uint256 transferAmt,
        address contractAddr,
        uint256 value,
        bytes calldata data,
        uint256 num
    ) external payable onlyAdmin {
        require(block.timestamp >= timestamp, "Too early");
        _mint(transferAmt, contractAddr, value, data, num);
    }

    function mintBlock(
        uint256 blockNumber,
        uint256 transferAmt,
        address contractAddr,
        uint256 value,
        bytes calldata data,
        uint256 num
    ) external payable onlyAdmin {
        require(block.number >= blockNumber, "Too early");
        _mint(transferAmt, contractAddr, value, data, num);
    }

    function _mint(
        uint256 transferAmt,
        address contractAddr,
        uint256 value,
        bytes memory data,
        uint256 num
    ) internal {
        require(
            getBalance() + msg.value >= transferAmt * num * klayToPeb,
            "Not enough klay to send transaction"
        );
        require(transferAmt >= value, "Transfer amount is less than value");

        for (uint256 i = 0; i < num; i++) {
            Minter newMinter = (new Minter).value(transferAmt * klayToPeb)(
                msg.sender,
                contractAddr,
                value,
                data
            );

            minters.push(newMinter);
        }
        emit Minted();
    }

    function call(
        uint256 idx,
        uint256 transferAmt,
        address contractAddr,
        uint256 value,
        bytes memory data
    ) public payable onlyAdmin {
        require(
            getBalance() + msg.value >= transferAmt * klayToPeb,
            "Not enough klay to send transaction"
        );
        _call(idx, transferAmt, contractAddr, value, data);
    }

    function _call(
        uint256 idx,
        uint256 transferAmt,
        address contractAddr,
        uint256 value,
        bytes memory data
    ) private {
        minters[idx].call.value(transferAmt * klayToPeb)(
            contractAddr,
            value,
            data
        );
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getMinters() external view returns (Minter[] memory) {
        return minters;
    }

    function deposit() external payable {
        emit Deposit(msg.value);
    }

    function withdraw() external onlyAdmin {
        address payable addr = creator();
        uint256 value = getBalance();
        addr.transfer(value);

        emit Withdrawal(value);
    }

    function depositMinters(uint256[] calldata idx, uint256[] calldata balance)
        external
        payable
    {
        require(
            idx.length == balance.length,
            "idx and balance length does not match"
        );

        uint256 total = 0;
        for (uint256 i = 0; i < idx.length; i++) total += balance[i];

        require(msg.value >= total, "balance is larger than sent klay");

        for (uint256 i = 0; i < idx.length; i++)
            _depositMinters(idx[i], balance[i]);
    }

    function depositMinters(uint256 idx, uint256 balance) external payable {
        _depositMinters(idx, balance);
    }

    function _depositMinters(uint256 idx, uint256 balance) private {
        minters[idx].deposit.value(balance)();
    }

    function withdrawMinters() external onlyAdmin {
        for (uint256 i = 0; i < minters.length; i++) {
            _withdrawMinters(i);
        }
    }

    function withdrawMinters(uint256 idx) external onlyAdmin {
        _withdrawMinters(idx);
    }

    function _withdrawMinters(uint256 idx) private {
        require(idx < minters.length, "Invalid idx");
        minters[idx].withdraw();
    }

    function suicideMinters() external onlyAdmin {
        for (uint256 i = 0; i < minters.length; i++) {
            _suicideMinters(i);
        }
    }

    function suicideMinters(uint256 idx) external onlyAdmin {
        _suicideMinters(idx);
    }

    function _suicideMinters(uint256 idx) private {
        require(idx < minters.length, "Invalid idx");
        minters[idx].SUICIDE();
    }

    function SUICIDE() external onlyAdmin {
        address payable addr = creator();
        selfdestruct(addr);
    }

    function() external payable {}
}
