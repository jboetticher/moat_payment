// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // This is the USDC contract address on mainnet, but you should double check.
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const MoatPayment = await hre.ethers.getContractFactory("MoatPayment");
  const mP = await MoatPayment.deploy(USDCAddress);

  await mP.deployed();

  console.log("MoatPayment deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
