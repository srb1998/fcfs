
const { ethers } = require("hardhat");

async function main() {
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  const deployWhitelistContract = await whitelistContract.deploy(10);

  await deployWhitelistContract.deployed();

  console.log("Whitelist Contract Address",deployWhitelistContract.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
