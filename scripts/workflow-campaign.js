const { createCampaign } = require("./create-campaign")
const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const { prepareInfluencers } = require("./prepare-influencers")
const { applyToCampaign } = require("./apply-to-campaign")
const { approveReject } = require("./approve-reject")
const { submitPost } = require("./submit-post")



async function workflowCampaign() {
    await createCampaign();
    await prepareInfluencers();
    await applyToCampaign();
    await approveReject();
    await createPost();
    // await submitPost();
}

workflowCampaign()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })