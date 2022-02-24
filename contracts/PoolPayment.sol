// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// NOTE: If you don't want to use hardhat to deploy, then comment out line 4 and feel free to use what you had before in remix.
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract PoolPayment {
    event PoolCreated(
        string moatName,
        string pool,
        string indexed poolName,
        address indexed validator,
        address indexed creator
    );
    event PoolFunded(
        string indexed poolName,
        address indexed validator,
        address indexed creator,
        uint256 fundsAdded,
        uint256 totalFunds
    );
    event ValidatorTransferred(
        string indexed poolName,
        address indexed newValidator,
        address indexed oldValidator
    );

    IERC20 public escrowToken;

    struct Pool {
        uint256 pool;
        address validator;
        address creator;
    }

    mapping(string => Pool) public pools;

    constructor(address _escrowToken) {
        escrowToken = IERC20(_escrowToken);
    }

    modifier isValidator(string calldata poolName) {
        require(
            pools[poolName].validator == msg.sender,
            "PoolPayment: you are not the validator for this pool."
        );
        _;
    }

    /**
     *  Creates a new moat (pool). Will fail if another moat of the same name has been registered in the past.
     */
    function createPool(string calldata poolName, address validator, string calldata moat) public {
        require(
            pools[poolName].creator == address(0x0),
            "PoolPayment: pool already exists."
        );
        pools[poolName] = Pool(0, validator, msg.sender);

        emit PoolCreated(moat, poolName, poolName, validator, msg.sender);
    }

    /**
     *  Adds fund to a moat.
     */
    function fundPool(string calldata poolName, uint256 amt) public payable {
        Pool storage pool = pools[poolName];
        require(
            pool.validator != address(0x0),
            "PoolPayment: pool does not exist."
        );

        /** NOTE:
         *  A smart contract cannot approve tokens for someone by design (security).
         *  This is what has to happen in your frontend:
         *  1. User is prompted to approve "x" amount of escrowToken for MoatPayment.
         *  2. Frontend validates that approval finishes.
         *  3. User is prompted to call fundMoat for "y" amount of escrowToken, where y <= x.
         */
        bool success = escrowToken.transferFrom(msg.sender, address(this), amt);
        require(success, "PoolPayment: token did not successfully transfer.");

        pool.pool += amt;
        emit PoolFunded(poolName, pool.validator, pool.creator, amt, pool.pool);
    }

    /**
     *  Allows the validator to withdraw a token from a moat (pool).
     */
    function withdrawFromPool(string calldata poolName, uint256 amt)
        public
        isValidator(poolName)
    {
        Pool storage pool = pools[poolName];
        require(
            pool.pool >= amt,
            "PoolPayment: not enough value in pool."
        );

        pools[poolName].pool -= amt;
        bool success = escrowToken.transfer(pool.validator, amt);
        require(success, "PoolPayment: token did not successfully transfer.");
    }

    /**
     * Transfers the validator role of a moat to another address.
     */
    function transferValidator(string calldata poolName, address newValidator)
        public
        isValidator(poolName)
    {
        require(
            newValidator != address(0x0),
            "PoolPayment: do not transfer validator to the zero address."
        );
        address oldValidator = pools[poolName].validator;
        pools[poolName].validator = newValidator;
        emit ValidatorTransferred(poolName, newValidator, oldValidator);
    }
}
