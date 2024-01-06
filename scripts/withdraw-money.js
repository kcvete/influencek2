const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0 // SET THIS BEFORE RUNNING SCRIPT

async function ApproveReject() {
    const accounts = await ethers.getSigners()

    const [deployer, owner, influencer1, influencer2, influencer3] = accounts

    const IDENTITIES = {
        [deployer.address]: "DEPLOYER",
        [owner.address]: "OWNER",
        [influencer1.address]: "INFLUENCER_1",
        [influencer2.address]: "INFLUENCER_2",
        [influencer3.address]: "INFLUENCER_3",
    }

    // approve influencers, 1 and 2 and reject 3

    const nftMarketplaceContract = await ethers.getContract("InfluencerMarketing")

    let tx = await nftMarketplaceContract
        .connect(influencer1)
        .withdrawProceeds()
        

    await tx.wait(1)

    console.log("Withdrawn influencer 1!")

    
    tx = await nftMarketplaceContract
    .connect(influencer2)
    .withdrawProceeds()
    
    console.log("Approved influencer 2!")

    await tx.wait(1)


    
}

ApproveReject()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

module.exports.ApproveReject = ApproveReject;