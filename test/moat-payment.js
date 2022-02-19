const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deployment() {
  const MoatPayment = await ethers.getContractFactory("MoatPayment");
  const TestERC20 = await ethers.getContractFactory("TestERC20");

  const erc20 = await TestERC20.deploy();
  await erc20.deployed();
  const mP = await MoatPayment.deploy(erc20.address);
  await mP.deployed();
  
  return { mP, erc20 };
}

describe("MoatPayment", async function () {


  it("Should properly construct.", async function () {
    const { mP, erc20 } = await deployment();
    expect(await mP.escrowToken()).to.equal(erc20.address);
  });

  it("Should restrict funding without a preexisting moat.", async function() {
    const { mP } = await deployment();
    let moatFundingHadError = false;
    try {
      await mP.fundMoat("randomMoat", 1);
    }
    catch { moatFundingHadError = true; }

    expect(moatFundingHadError).to.be.true;
  });

  it("Should properly allow creation of a moat.", async function() {
    const { mP } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await mP.createMoat("moat1", addr1.address);
    let firstMoat = await mP.moats("moat1");

    expect(firstMoat.pool).to.equal(0);
    expect(firstMoat.validator).to.equal(addr1.address);
    expect(firstMoat.creator).to.equal(addr0.address);
  });

  it("Should not overwrite a previously created moat.", async function() {
    const { mP } = await deployment();

    let moatCreationHadError = false;
    const [ addr0, addr1 ] = await ethers.getSigners();
    try {
      await mP.createMoat("moat1", addr0.address);
      await mP.createMoat("moat1", addr1.address);
    }
    catch { moatCreationHadError = true; }

    expect(moatCreationHadError).to.be.true;
  });

  it("Should allow moats to be funded.", async function() {
    const { mP, erc20 } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await erc20.transfer(addr1.address, 100);
    await mP.createMoat("moat1", addr0.address);

    await erc20.approve(mP.address, 50);
    await mP.fundMoat("moat1", 25);
    let moat1 = await mP.moats("moat1");

    expect(moat1.pool).to.be.equal(25);

    await erc20.connect(addr1).approve(mP.address, 50);
    await mP.connect(addr1).fundMoat("moat1", 15);
    moat1 = await mP.moats("moat1");

    expect(moat1.pool).to.be.equal(40);
  });

  it("Should restrict withdrawls to validators.", async function() {
    const { mP, erc20 } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await mP.createMoat("moat1", addr1.address);

    const FUND_AMT = 25;
    await erc20.approve(mP.address, 50);
    await mP.fundMoat("moat1", FUND_AMT);

    let moatWithdrawlHadError = false;
    try {
      await mP.connect(addr0).withdrawFromPool("moat1", FUND_AMT);
    }
    catch { moatWithdrawlHadError = true; }

    expect(moatWithdrawlHadError).to.be.true;

    await mP.connect(addr1).withdrawFromPool("moat1", FUND_AMT);
    const addr1TokenCount = await erc20.balanceOf(addr1.address);

    expect(addr1TokenCount).to.be.equal(FUND_AMT);
  });

  it("Should properly restrict transfering of the validator role.", async function() {
    const { mP } = await deployment();
    const [ addr0, addr1 ] = await ethers.getSigners();
    await mP.createMoat("moat1", addr1.address);

    let moatValidatorTransferHadError = false;
    try {
      await mP.connect(addr0).transferValidator("moat1", addr0.address);
    }
    catch { moatValidatorTransferHadError = true; }

    expect(moatValidatorTransferHadError).to.be.true;

    await mP.connect(addr1).transferValidator("moat1", addr0.address);
    let moat = await mP.moats("moat1");

    expect(moat.validator).to.be.equal(addr0.address);

    moatValidatorTransferHadError = false;
    try {
      await mP.connect(addr1).transferValidator("moat1", addr1.address);
    }
    catch { moatValidatorTransferHadError = true; }

    expect(moatValidatorTransferHadError).to.be.true;
  });

  // TODO: Feel free to finish writing tests ...

  // Check error for withdrawl of too many tokens
  // Check error if user doesn't have enough tokens
  // Check error if user hasn't approved enough tokens
});
