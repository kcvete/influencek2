const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 1

//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
//0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
//0x5FbDB2315678afecb367f032d93F642f64180aa3
// 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
async function getAllListings() {
    const nftStore = await ethers.getContract("NftStore")
   // const listings = await nftStore.getListing("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", 1)
   // const listings = await nftStore.getListings("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")
   // console.log(listings)

    const listing2 = await nftStore.getListings("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
    console.log(listing2)

    //const listing4 = await nftStore.getListing("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", 1)
    //console.log(listing4)

    //const listing3 = await nftStore.getListing("0x5FbDB2315678afecb367f032d93F642f64180aa3", 1)
    //console.log(listing3)

}

getAllListings()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
