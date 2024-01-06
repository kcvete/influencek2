const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function applyToCampaign() {
    const accounts = await ethers.getSigners()

    const [deployer, owner, influencer1, influencer2, influencer3] = accounts

    const IDENTITIES = {
        [deployer.address]: "DEPLOYER",
        [owner.address]: "OWNER",
        [influencer1.address]: "INFLUENCER_1",
        [influencer2.address]: "INFLUENCER_2",
        [influencer3.address]: "INFLUENCER_3",
    }

    const nftMarketplaceContract = await ethers.getContract("InfluencerMarketing")

    let tx = await nftMarketplaceContract
        .connect(influencer1)
        .applyToCampaign(0)

    await tx.wait(1)

    console.log("Applied to Campaign!", IDENTITIES[influencer1.address])

    tx = await nftMarketplaceContract
        .connect(influencer2)
        .applyToCampaign(0)

    await tx.wait(1)

    console.log("Applied to Campaign!", IDENTITIES[influencer2.address])

    tx = await nftMarketplaceContract
        .connect(influencer3)
        .applyToCampaign(0)

    await tx.wait(1)

    console.log("Applied to Campaign!", IDENTITIES[influencer3.address])


}

applyToCampaign()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

module.exports.applyToCampaign = applyToCampaign;