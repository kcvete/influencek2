const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function prepareInfluencers() {
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
    // create fake history for testing, 1.2% engagement rate, 5000 followers
    let tx = await nftMarketplaceContract
        .connect(influencer1)
        .importStatistics(3, 5000)


    await tx.wait(1)

    console.log('imported stats for influencer 1')

    tx = await nftMarketplaceContract
        .connect(influencer2)
        .importStatistics(2, 80000)

        await tx.wait(1)

    console.log('imported stats for influencer 2')
    tx = await nftMarketplaceContract
        .connect(influencer3)
        .importStatistics(4, 3000)

    await tx.wait(1)

    console.log('imported stats for influencer 3')


}

prepareInfluencers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })