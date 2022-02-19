const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MoatPayment", function () {
  it("Should properly deploy.", async function () {
    const MoatPayment = await ethers.getContractFactory("MoatPayment");
    const mP = await MoatPayment.deploy();
    await mP.deployed();

    // TODO: Feel free to finish writing tests ...
    // https://hardhat.org/guides/waffle-testing.html

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
