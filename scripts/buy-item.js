const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 1

async function buyItem() {
    const refferalAddress = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"
    const nftStore = await ethers.getContract("NftStore")
    const basicNft = await ethers.getContract("BasicNft")
    const listing = await nftStore.getListing(basicNft.address, TOKEN_ID)
    const price = listing.price.toString()
    // if its payable, you can send value as last argument
    const tx = await nftStore.buyItem(basicNft.address, TOKEN_ID, refferalAddress, { value: price })
    await tx.wait(1)
    console.log("NFT Bought!")
    if ((network.config.chainId == "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
