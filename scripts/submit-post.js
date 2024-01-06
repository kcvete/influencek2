const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0 // SET THIS BEFORE RUNNING SCRIPT

async function submitPost() {
    const accounts = await ethers.getSigners()

    const [deployer, owner, influencer1, influencer2, influencer3] = accounts
    console.log('owner: ', owner.address);

    const IDENTITIES = {
        [deployer.address]: "DEPLOYER",
        [owner.address]: "OWNER",
        [influencer1.address]: "INFLUENCER_1",
        [influencer2.address]: "INFLUENCER_2",
        [influencer3.address]: "INFLUENCER_3",
    }

    // submity post for influencers 1 and 2, with fake instagram id
    const nftMarketplaceContract = await ethers.getContract("InfluencerMarketing")

    let tx = await nftMarketplaceContract
        .connect(influencer1)
        .submitPost(0, 123456789)

    await tx.wait(1)

    console.log("Submitted post for influencer 1!")

    tx = await nftMarketplaceContract
        .connect(influencer2)
        .submitPost(0, 2641515)

    await tx.wait(1)

    console.log("Submitted post for influencer 2!")

   

    
}

submitPost()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

module.exports.submitPost = submitPost;