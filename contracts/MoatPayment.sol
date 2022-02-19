// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract MoatPayment {

    event MoatCreated(string indexed moatName, address indexed validator, address indexed creator);
    event MoatFunded(string indexed moatName, address indexed validator, address indexed creator, uint fundsAdded, uint totalFunds);
    event ValidatorTransferred(string indexed moatName, address indexed newValidator, address indexed oldValidator);

    IERC20 public escrowToken;

    struct Moat {
        uint pool;
        address validator;
        address creator;
    }

    mapping (string => Moat) public moats;

    constructor(address _tokenAddr ) {
        escrowToken = IERC20(_tokenAddr);
    }

    function createMoat (string calldata moatName, address validator) public {
		require(moats[moatName].creator == address(0x0), "MoatPayment: moat already exists.");
		moats[moatName] = Moat(0, validator, msg.sender);

        emit MoatCreated(moatName, validator, msg.sender);
	}

    function fundMoat (string calldata moatName, uint amt) public payable {
        Moat storage moat = moats[moatName];
        require(moat.validator != address(0x0), "MoatPayment: moat does not exist.");
        
        /** NOTE:
         *  A smart contract cannot approve tokens for someone by design (security).
         *  This is what has to happen in your frontend:
         *  1. User is prompted to approve "x" amount of escrowToken for MoatPayment.
         *  2. Frontend validates that approval finishes.
         *  3. User is prompted to call fundMoat for "y" amount of escrowToken, where y <= x.
         */
        escrowToken.transferFrom(msg.sender, address(this), amt);

        moat.pool += amt;
        emit MoatFunded(moatName, moat.validator, moat.creator, amt, moat.pool);
    }

    modifier isValidator(string calldata moatName) {
        require(moats[moatName].validator == msg.sender, "You are not the validator for this moat");
        _;
    }

    function withdrawFromPool (string calldata moatName, uint amt) public isValidator(moatName) {
        Moat storage moat = moats[moatName];
        require(moat.pool >= amt, "MoatPayment: not enough value in pool.");

        moats[moatName].pool -= amt;
        escrowToken.transfer(moat.validator, amt);
    }

    function transferValidator (string calldata moatName, address newValidator) public isValidator(moatName) {
        address oldValidator = moats[moatName].validator;
        moats[moatName].validator = newValidator;
        emit ValidatorTransferred(moatName, newValidator, oldValidator);
    }

}