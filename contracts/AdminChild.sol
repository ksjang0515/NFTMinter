pragma solidity ^0.5.0;

import "./Admin.sol";

contract AdminChild is Admin {
    function isQualified() public view onlyAdmin {}
}
