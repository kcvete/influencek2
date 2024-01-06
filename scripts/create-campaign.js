const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0 // SET THIS BEFORE RUNNING SCRIPT

async function createCampaign() {
    const accounts = await ethers.getSigners()

    const [deployer, owner, buyer1] = accounts

    const IDENTITIES = {
        [deployer.address]: "DEPLOYER",
        [owner.address]: "OWNER",
        [buyer1.address]: "BUYER_1",
    }

    
    const nftMarketplaceContract = await ethers.getContract("InfluencerMarketing")

   const createCampaignObj = {
        name: "Poslovna informatika",
        description: "Kampanja za širjenje zavedanja o poslovni informatiki.",
        minimumEngagementRate: 1,
        // budget is 25 ether
        budget: ethers.utils.parseEther("25"),
        company: owner.address,
        isActive: true
   }    


    const tx = await nftMarketplaceContract
          .connect(owner)
          .createCampaign(
            createCampaignObj.name,
            createCampaignObj.description,
            createCampaignObj.minimumEngagementRate,
            createCampaignObj.budget,
            { value: createCampaignObj.budget}
            )
     await tx.wait(1)
    
     const campaign = await nftMarketplaceContract
          .getCampaign(0)
     console.log(campaign)
}

createCampaign()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

    module.exports.createCampaign = createCampaign;