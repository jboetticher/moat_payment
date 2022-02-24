const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deployment() {
  const PoolPayment = await ethers.getContractFactory("PoolPayment");
  const TestERC20 = await ethers.getContractFactory("TestERC20");

  const erc20 = await TestERC20.deploy();
  await erc20.deployed();
  const mP = await PoolPayment.deploy(erc20.address);
  await mP.deployed();
  
  return { mP, erc20 };
}

describe("PoolPayment", async function () {


  it("Should properly construct.", async function () {
    const { mP, erc20 } = await deployment();
    expect(await mP.escrowToken()).to.equal(erc20.address);
  });

  it("Should restrict funding without a preexisting pool.", async function() {
    const { mP } = await deployment();
    let poolFundingHadError = false;
    try {
      await mP.fundPool("randomPool", 1);
    }
    catch { poolFundingHadError = true; }

    expect(poolFundingHadError).to.be.true;
  });

  it("Should properly allow creation of a pool.", async function() {
    const { mP } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await mP.createPool("pool1", addr1.address, 'moat1');
    let firstPool = await mP.pools("pool1");

    expect(firstPool.pool).to.equal(0);
    expect(firstPool.validator).to.equal(addr1.address);
    expect(firstPool.creator).to.equal(addr0.address);
  });

  it("Should not overwrite a previously created pool.", async function() {
    const { mP } = await deployment();

    let poolCreationHadError = false;
    const [ addr0, addr1 ] = await ethers.getSigners();
    try {
      await mP.createPool("pool1", addr0.address, 'moat1');
      await mP.createPool("pool1", addr1.address, 'moat1');
    }
    catch { poolCreationHadError = true; }

    expect(poolCreationHadError).to.be.true;
  });

  it("Should allow pools to be funded.", async function() {
    const { mP, erc20 } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await erc20.transfer(addr1.address, 100);
    await mP.createPool("pool1", addr0.address, 'moat1');

    await erc20.approve(mP.address, 50);
    await mP.fundPool("pool1", 25);
    let pool1 = await mP.pools("pool1");

    expect(pool1.pool).to.be.equal(25);

    await erc20.connect(addr1).approve(mP.address, 50);
    await mP.connect(addr1).fundPool("pool1", 15);
    pool1 = await mP.pools("pool1");

    expect(pool1.pool).to.be.equal(40);
  });

  it("Should restrict withdrawls to validators.", async function() {
    const { mP, erc20 } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await mP.createPool("pool1", addr1.address, 'moat1');

    const FUND_AMT = 25;
    await erc20.approve(mP.address, 50);
    await mP.fundPool("pool1", FUND_AMT);

    let poolWithdrawlHadError = false;
    try {
      await mP.connect(addr0).withdrawFromPool("pool1", FUND_AMT);
    }
    catch { poolWithdrawlHadError = true; }

    expect(poolWithdrawlHadError).to.be.true;

    await mP.connect(addr1).withdrawFromPool("pool1", FUND_AMT);
    const addr1TokenCount = await erc20.balanceOf(addr1.address);

    expect(addr1TokenCount).to.be.equal(FUND_AMT);
  });

  it("Should properly restrict transfering of the validator role.", async function() {
    const { mP } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await mP.createPool("pool1", addr1.address, 'moat1');

    let poolValidatorTransferHadError = false;
    try {
      await mP.connect(addr0).transferValidator("pool1", addr0.address);
    }
    catch { poolValidatorTransferHadError = true; }

    expect(poolValidatorTransferHadError).to.be.true;

    await mP.connect(addr1).transferValidator("pool1", addr0.address);
    let pool = await mP.pools("pool1");

    expect(pool.validator).to.be.equal(addr0.address);

    poolValidatorTransferHadError = false;
    try {
      await mP.connect(addr1).transferValidator("pool1", addr1.address);
    }
    catch { poolValidatorTransferHadError = true; }

    expect(poolValidatorTransferHadError).to.be.true;
  });

  // TODO: Feel free to finish writing tests ...

  // Check error for withdrawl of too many tokens
  // Check error if user doesn't have enough tokens
  // Check error if user hasn't approved enough tokens
});
