const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const fs = require('fs');

const TOKEN_ID = 1

const express = require('express');
const axios = require('axios');
const { campaign } = require("google-ads-api/build/src/protos/autogen/resourceNames");

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Mock Instagram API URL
const MOCK_INSTAGRAM_API_URL = 'http://localhost:3001/instagram';

const returnFakeInstagramData = async (instagramId) => {
  // engagment from 1 to 5 
  const avgEngagement = Math.floor(Math.random() * 5) + 1;
  // likes from 100 to 100000 
  const avgLikes = Math.floor(Math.random() * 100000);
  // comments from 0 to 5000
  const avgComments = Math.floor(Math.random() * 5000);
  // views from 0 to 1000000
  const avgViews = Math.floor(Math.random() * 1000000);

  return {
    engagement: avgEngagement,
    likes: avgLikes,
    comments: avgComments,
    views: avgViews,
  };
}


// Express server setup
app.listen(PORT, () => {
  console.log(`Oracle server is running on port ${PORT}`);
  fs.writeFileSync('./db/listings.json', JSON.stringify([]));
});

// Function to listen to events from the smart contract
async function listenToContractEvents() {
    const nftStore = await ethers.getContract("NftStore")

    const accounts = await ethers.getSigners()

    const [deployer, owner, influencer1, influencer2, influencer3] = accounts

    const IDENTITIES = {
        [deployer.address]: "DEPLOYER",
        [owner.address]: "OWNER",
        [influencer1.address]: "INFLUENCER_1",
        [influencer2.address]: "INFLUENCER_2",
        [influencer3.address]: "INFLUENCER_3",
    }

    nftStore.on('ItemBought', async (buyer, nftAddress, tokenId, price) => {
        console.log('nftAddress: ', nftAddress);
        console.log('buyer: ', buyer);
      
      try {
        // find and remove the listing from the listings.json file
        const listings = JSON.parse(fs.readFileSync('./db/listings.json')) || [];
        const newListing = listings.filter(listing => listing.id !== `${nftAddress}-${tokenId}`);
        fs.writeFileSync('./db/listings.json', JSON.stringify(newListing));
      } catch (error) {
        console.error(`Error fetching data: ${error}`);
      }
    });

    nftStore.on('ItemListed', async (seller, nftAddress, tokenId, price) => {
      const basicNft = await ethers.getContract("BasicNft")
      const tokenUri = await basicNft.tokenURI(tokenId)
      
      // create id for the listing
      const id = `${nftAddress}-${tokenId}`;
     
      const listings = JSON.parse(fs.readFileSync('./db/listings.json')) || [];
      listings.push({seller, nftAddress, tokenId, price, tokenUri, id});
      fs.writeFileSync('./db/listings.json', JSON.stringify(listings));
    }
    );

    // influencer marketing store

    const influencerMarketingStore = await ethers.getContract("InfluencerMarketing")

    // post submitted

    influencerMarketingStore.on('PostSubmitted', async (campaignId, influencer, instagramPostId) => {      
      const instagramData = await returnFakeInstagramData(instagramPostId);
      // wait from 5 to 10 seconds
      //const waitTime = Math.floor(Math.random() * 5) + 5;
      //await moveBlocks(waitTime, (sleepAmount = 1000));
      try {
        // Sending data back to the smart contract
        let tx = await influencerMarketingStore
          .connect(owner)
          .createCampaignData(influencer, campaignId, instagramData.engagement, instagramData.views);

        await tx.wait(1);
         // payInfluencer(_campaign_id, _influencer, _engagementRate, _views);
         await influencerMarketingStore
          .connect(owner)
          .payInfluencer(campaignId, influencer, instagramData.engagement, instagramData.views);

        await tx.wait(1);
      } catch (error) {
        console.error(`Error fetching data: ${error}`);
      }

      /*

    event UpdatedStatistics(
        address influencer,
        uint256 avgEngagementRate,
        uint256 numberOfCampaigns,
        uint256 avgViews
    );
      */
      influencerMarketingStore.on('UpdatedStatistics', async (influencer, avgEngagementRate, numberOfCampaigns, avgViews) => {
        console.log('------------------');
        console.log('Congrats, you have updated your statistics!');
        avgEngagementRate = parseInt(avgEngagementRate._hex, 16);
        numberOfCampaigns = parseInt(numberOfCampaigns._hex, 16);
        avgViews = parseInt(avgViews._hex, 16);
        console.log('Influencer: ', influencer);
        console.log('Average engagement rate: ', avgEngagementRate);
        console.log('Number of campaigns: ', numberOfCampaigns);
        console.log('Average views: ', avgViews);
        console.log('------------------');
      }
      );
      /*
    })
    
    event CampaignCreated(
        string name,
        string description,
        uint256 minimumEngagementRate,
        uint256 budget,
        address company
    );
      */
    }
    );
  influencerMarketingStore.on('CampaignCreated', async (name, description, minimumEngagementRate, budget, company) => {
    console.log('------------------');
    console.log('Congrats, you have created a campaign!');
    minimumEngagementRate = parseInt(minimumEngagementRate._hex, 16);
    budget = parseInt(budget._hex, 16);
    console.log('Cammpaign info:',);
    console.log('Name: ', name);
    console.log('Description: ', description);
    console.log('Minimum engagement rate: ', minimumEngagementRate);
    // transform budget from wei to ether
    budget = ethers.utils.formatEther(budget.toString());
    console.log('Budget: ', budget, 'ETH');
    console.log('Company: ', company);
    console.log('------------------');
  }
  );

  /*
 event InfluencerApplied(
        uint256 campaignId,
        address influencer
    );

    event InfluencerApproved(
        uint256 campaignId,
        address influencer
    );

    event InfluencerRejected(
        uint256 campaignId,
        address influencer
    );
  */

  influencerMarketingStore.on('InfluencerApplied', async (campaignId, influencer) => {
    const newBalance = await ethers.provider.getBalance(influencer);
    console.log('------------------');
    console.log('Congrats, you have applied to a campaign!');
    campaignId = parseInt(campaignId._hex, 16);
    console.log('Campaign ID: ', campaignId);
    console.log('Influencer: ', influencer);
    console.log('------------------');
  }
  );

  influencerMarketingStore.on('InfluencerApproved', async (campaignId, influencer) => {
    const newBalance = await ethers.provider.getBalance(influencer);
    console.log('------------------');
    console.log('Congrats, you have been approved for a campaign!');
    campaignId = parseInt(campaignId._hex, 16);
    console.log('Campaign ID: ', campaignId);
    console.log('Influencer: ', influencer);
    console.log('------------------');
  }
  );

  influencerMarketingStore.on('InfluencerRejected', async (campaignId, influencer) => {
    const newBalance = await ethers.provider.getBalance(influencer);
    console.log('------------------');
    console.log('Sorry, you have been rejected for a campaign!');
    campaignId = parseInt(campaignId._hex, 16);
    console.log('Campaign ID: ', campaignId);
    console.log('Influencer: ', influencer);
    console.log('New balance: ', ethers.utils.formatEther(newBalance));
    console.log('------------------');
  }
  );

  /*
      event InfluencerPaid(
        uint256 campaignId,
        address influencer,
        uint256 engagementRate,
        uint256 views
        uint256 payment
    );

    event PostSubmitted(
        uint256 campaignId,
        address influencer,
        string instagramPostId
    );
  */

  influencerMarketingStore.on('InfluencerPaid', async (campaignId, influencer, engagementRate, views, payment) => {
    const newBalance = await ethers.provider.getBalance(influencer);
    console.log('------------------');
    console.log('Congrats, you have been paid for a campaign!');
    campaignId = parseInt(campaignId._hex, 16);
    engagementRate = parseInt(engagementRate._hex, 16);
    views = parseInt(views._hex, 16);
    console.log('Campaign ID: ', campaignId);
    console.log('Influencer: ', influencer);
    console.log('Engagement rate: ', engagementRate);
    console.log('Views: ', views);
    console.log('Payment: ', ethers.utils.formatEther(payment));
    console.log('New balance: ', ethers.utils.formatEther(newBalance));
    console.log('------------------');
  }
  );

  influencerMarketingStore.on('withdraw', async (influencer, proceeds) => {
    const newBalance = await ethers.provider.getBalance(influencer);
    console.log('------------------');
    console.log('Congrats, you have withdrawn your proceeds!');
    console.log('Influencer: ', influencer);
    console.log('Proceeds: ', ethers.utils.formatEther(proceeds));
    console.log('New balance: ', ethers.utils.formatEther(newBalance));
    console.log('------------------');
    }
  );

  influencerMarketingStore.on('PostSubmitted', async (campaignId, influencer, instagramPostId) => {
    console.log('------------------');
    console.log('Congrats, you have submitted a post for a campaign!');
    campaignId = parseInt(campaignId._hex, 16);
    console.log('Campaign ID: ', campaignId);
    console.log('Influencer: ', influencer);
    console.log('Instagram post ID: ', instagramPostId);
    console.log('------------------');
  }
  );
    /*
        event withdraw(
        address influencer,
        uint256 proceeds
    );
    */
}
  listenToContractEvents();
  
// endpoint that serves the listings
// allow cors for development
app.get('/listings', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const listings = JSON.parse(fs.readFileSync('./db/listings.json')) || [];
  res.json(listings);
});
