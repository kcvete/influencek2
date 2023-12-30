const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 1

async function getAccountsBalance() {
    const accounts = await ethers.getSigners();
    for (const account of accounts) {
        console.log(account.address);
        // balance in ETH
        console.log(ethers.utils.formatEther(await account.getBalance()));
    }

}

getAccountsBalance()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
