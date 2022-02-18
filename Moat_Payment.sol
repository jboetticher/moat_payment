// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";


contract Moat_Payment {

    IERC20 public escrowToken;

    struct Moat {
        uint pool;
        address validator;
        address creator;
    }

    mapping (string => Moat) public moats;

    constructor( address _tokenAddr ) {
        escrowToken = IERC20(_tokenAddr);
    }

    function createMoat (string calldata _name, address _validator) public {
		require(moats[_name].creator == address(0x0), "Moat already exists");
		moats[_name] = Moat(0, _validator, msg.sender);
	}

    function fundMoat (string calldata _name, uint _amt) public payable {
        require(moats[_name].validator != address(0x0), "Moat does not exist");
        //FIXME: must implement actual USDC functionality, this is just pseudocode
        escrowToken.allowance()
        moats[_name].pool += _amt;
    }

    modifier isValidator(string calldata _moat) {
        require(moats[_moat].validator == msg.sender, "You are not the validator for this moat");
        _;
    }

    function withdrawFromPool (string calldata _moat, uint _amt) public isValidator(_moat) {
        moats[_moat].pool -= _amt;
        //FIXME: Transfer USDC to validator
    }

    function transferValidator (string calldata _moat, address _newValidator) public isValidator(_moat) {
        moats[_moat].validator = _newValidator;
    }

}