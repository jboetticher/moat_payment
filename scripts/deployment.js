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
  const USDCAddress = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
  const PoolPayment = await hre.ethers.getContractFactory("PoolPayment");
  const mP = await PoolPayment.deploy(USDCAddress);

  await mP.deployed();

  console.log("PoolPayment deployed to:", mP.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
