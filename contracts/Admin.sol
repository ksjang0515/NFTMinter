pragma solidity ^0.5.0;

contract Admin {
    mapping(address => bool) private _admins;
    address payable _creator;

    event AdminAdded(address indexed Authorizer, address indexed NewAdmin);
    event AdminRemoved(
        address indexed Authorizer,
        address indexed RemovedAdmin
    );

    constructor() public {
        _admins[msg.sender] = true;
        _creator = msg.sender;
    }

    function creator() public view returns (address payable) {
        return _creator;
    }

    function isCreator() public view returns (bool) {
        return msg.sender == creator();
    }

    function addAdmin(address newAdmin) public onlyAdmin {
        _admins[newAdmin] = true;
        emit AdminAdded(msg.sender, newAdmin);
    }

    function removeAdmin(address adminAddr) public onlyAdmin {
        _admins[adminAddr] = false;
        emit AdminRemoved(msg.sender, adminAddr);
    }

    function isAdmin(address addr) public view returns (bool) {
        return _admins[addr];
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Caller is not Admin");
        _;
    }
}
