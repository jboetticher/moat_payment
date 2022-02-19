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

  // TODO: Feel free to finish writing tests ...
});
