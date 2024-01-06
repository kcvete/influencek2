const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const fs = require('fs');

const TOKEN_ID = 1

const express = require('express');
const axios = require('axios');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Mock Instagram API URL
const MOCK_INSTAGRAM_API_URL = 'http://localhost:3001/instagram';



// Express server setup
app.listen(PORT, () => {
  console.log(`Oracle server is running on port ${PORT}`);
  fs.writeFileSync('./db/listings.json', JSON.stringify([]));
});

// Function to listen to events from the smart contract
async function listenToContractEvents() {
    const nftStore = await ethers.getContract("NftStore")

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

      // get token uri from nftAddress and tokenId

      const basicNft = await ethers.getContract("BasicNft")
      const tokenUri = await basicNft.tokenURI(tokenId)
      
      // create id for the listing
      const id = `${nftAddress}-${tokenId}`;
     
      const listings = JSON.parse(fs.readFileSync('./db/listings.json')) || [];
      listings.push({seller, nftAddress, tokenId, price, tokenUri, id});
      fs.writeFileSync('./db/listings.json', JSON.stringify(listings));
    }
    );
  }
  
  listenToContractEvents();
  
// endpoint that serves the listings
// allow cors for development
app.get('/listings', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const listings = JSON.parse(fs.readFileSync('./db/listings.json')) || [];
  res.json(listings);
});
