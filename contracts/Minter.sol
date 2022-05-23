pragma solidity ^0.5.0;

import "./Admin.sol";
import "@klaytn/contracts/token/KIP17/IKIP17.sol";

// TODO
// - Send remove signal to controller
// - Add transferFrom(KIP17) function for easy transfer

contract Minter is Admin {
    uint256 klayToPeb = 1000000000000000000;

    event Call(address contractAddr, uint256 value, bytes data, uint256 num);
    event Deposit(uint256 amount);
    event Withdrawal(uint256 amount);

    constructor(
        address payable txSender,
        address contractAddr,
        uint256 value,
        bytes memory data
    ) public payable {
        addAdmin(txSender);
        call(contractAddr, value, data);
    }

    function call(
        address contractAddr,
        uint256 value,
        bytes memory data
    ) public payable onlyAdmin {
        require(
            getBalance() + msg.value >= value * klayToPeb,
            "Not enough klay to send transaction"
        );

        _call(contractAddr, value, data);
    }

    function _call(
        address contractAddr,
        uint256 value,
        bytes memory data
    ) internal {
        (bool success, bytes memory data) = contractAddr.call.value(
            value * klayToPeb
        )(data);
        if (!success) {
            withdraw();
        }
    }

    function transferFrom(
        address nftContractAddr,
        address _to,
        uint256 _tokenId
    ) external {
        IKIP17 nftContract = IKIP17(nftContractAddr);
        nftContract.safeTransferFrom(address(this), _to, _tokenId);
    }

    function deposit() external payable {
        emit Deposit(msg.value);
    }

    function withdraw() public {
        address payable addr = creator();
        uint256 value = getBalance();
        addr.transfer(value);

        emit Withdrawal(value);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function SUICIDE() external onlyAdmin {
        address payable addr = creator();
        selfdestruct(addr);
    }

    function() external payable {}
}
