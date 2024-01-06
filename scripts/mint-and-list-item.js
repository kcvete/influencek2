const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

// price in ETH between 0.1 and 0.8

const PRICE = ethers.utils.parseEther((Math.floor(Math.random() * 8 + 1) / 10).toString())

const refferalPercentage = 2;

const images = ['https://i.imgur.com/wfR8wle.png', 'https://i.imgur.com/3sOpHdS.png', 'https://i.imgur.com/WRyW3LP.png']

const randomImage = images[Math.floor(Math.random() * images.length)]

async function mintAndList() {
    // list deployed contracts

    const nftStore = await ethers.getContract("NftStore")
    const randomNumber = Math.floor(Math.random() * 2)
    let basicNft
    if (randomNumber == 1) {
        basicNft = await ethers.getContract("BasicNft")
    } else {
        basicNft = await ethers.getContract("BasicNft")
    }
    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNft(randomImage)
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log("Approving NFT...")
    const approvalTx = await basicNft.approve(nftStore.address, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const tx = await nftStore.listItem(basicNft.address, tokenId, PRICE, refferalPercentage)
    await tx.wait(1)
    console.log("NFT Listed!")
    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 at once!
        await moveBlocks(1, (sleepAmount = 1000))
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
