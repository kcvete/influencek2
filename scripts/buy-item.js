const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0 // SET THIS BEFORE RUNNING SCRIPT

async function buyItem() {
    const accounts = await ethers.getSigners()
    const refferalAddress = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"

    const [deployer, owner, buyer1] = accounts

    const IDENTITIES = {
        [deployer.address]: "DEPLOYER",
        [owner.address]: "OWNER",
        [buyer1.address]: "BUYER_1",
    }

    const nftMarketplaceContract = await ethers.getContract("NftStore")
    const basicNftContract = await ethers.getContract("BasicNft")
    console.log('basicNftContract: ', basicNftContract);

    const listing = await nftMarketplaceContract
       .getListing(basicNftContract.address, TOKEN_ID)

    const price = listing.price.toString()
    const tx = await nftMarketplaceContract
        .connect(buyer1)
        .buyItem(basicNftContract.address, TOKEN_ID, refferalAddress, {
            value: price,
        })
    await tx.wait(1)
    console.log("NFT Bought!")

    const newOwner = await basicNftContract.ownerOf(TOKEN_ID)
    // New owner of Token ID ${TOKEN_ID} is ${newOwner} with identity of ${IDENTITIES[newOwner]}
    console.log(
        `New owner of Token ID ${TOKEN_ID} is ${newOwner} with identity of ${IDENTITIES[newOwner]}`
    )
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

    module.exports.buyItem = buyItem;