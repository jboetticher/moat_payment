// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// NOTE: If you don't want to use hardhat to deploy, then comment out line 4 and feel free to use what you had before in remix.
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

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

    constructor(address _escrowToken) {
        escrowToken = IERC20(_escrowToken);
    }

    modifier isValidator(string calldata moatName) {
        require(moats[moatName].validator == msg.sender, "MoatPayment: you are not the validator for this moat.");
        _;
    }

    /**
     *  Creates a new moat (pool). Will fail if another moat of the same name has been registered in the past.
     */
    function createMoat (string calldata moatName, address validator) public {
		require(moats[moatName].creator == address(0x0), "MoatPayment: moat already exists.");
		moats[moatName] = Moat(0, validator, msg.sender);

        emit MoatCreated(moatName, validator, msg.sender);
	}

    /**
     *  Adds fund to a moat.
     */
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
        bool success = escrowToken.transferFrom(msg.sender, address(this), amt);
        require(success, "MoatPayment: token did not successfully transfer.");

        moat.pool += amt;
        emit MoatFunded(moatName, moat.validator, moat.creator, amt, moat.pool);
    }

    /**
     *  Allows the validator to withdraw a token from a moat (pool).
     */
    function withdrawFromPool (string calldata moatName, uint amt) public isValidator(moatName) {
        Moat storage moat = moats[moatName];
        require(moat.pool >= amt, "MoatPayment: not enough value in moat's pool.");

        moats[moatName].pool -= amt;
        bool success = escrowToken.transfer(moat.validator, amt);
        require(success, "MoatPayment: token did not successfully transfer.");
    }

    /**
     * Transfers the validator role of a moat to another address.
     */
    function transferValidator (string calldata moatName, address newValidator) public isValidator(moatName) {
		require(newValidator != address(0x0), "MoatPayment: do not transfer validator to the zero address.");
        address oldValidator = moats[moatName].validator;
        moats[moatName].validator = newValidator;
        emit ValidatorTransferred(moatName, newValidator, oldValidator);
    }

}