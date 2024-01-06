// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();


contract InfluencerMarketing is ReentrancyGuard {

    event CampaignCreated(
        string name,
        string description,
        uint256 minimumEngagementRate,
        uint256 budget,
        address company
    );

    event UpdatedStatistics(
        address influencer,
        uint256 avgEngagementRate,
        uint256 numberOfCampaigns,
        uint256 avgViews
    );

    event CampaignUpdated(
        uint256 id,
        uint256 budget
    );

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

    event InfluencerPaid(
        uint256 campaignId,
        address influencer,
        uint256 engagementRate,
        uint256 views,
        uint256 payment
    );

    event PostSubmitted(
        uint256 campaignId,
        address influencer,
        string instagramPostId
    );

    event withdraw(
        address influencer,
        uint256 proceeds
    );

    struct CampaignInfluencer {
        uint256 campaignId;
        address influencer;
    }

    struct InfluencerHistory {
        uint256 campaignId;
        uint256 engagementRate;
        uint256 views;
        uint256 date;
    }

    struct InfluencerStatistic {
        uint256 avgEngagementRate;
        uint256 numberOfCampaigns;
        uint256 avgViews;
    }

    struct InfluencerPost {
        uint256 campaignId;
        address influencer;
        string instagramPostId;
    }

    struct Campaign {
        string name;
        string description;
        uint256 minimumEngagementRate;
        uint256 budget;
        address payable company;
        bool isActive;
    }

    Campaign[] public campaigns;
    // mapping influencer addres, to his history
    mapping(address => InfluencerHistory[]) public influencerHistory;
    // mapping influencer address to his statistic
    mapping(address => InfluencerStatistic) public influencerStatistic;
    // mapping influencer address to his applied campaigns
    mapping(uint256 => mapping(address => bool)) private influencersApplied;
    // mapping influencer address to his approved campaigns
    mapping(uint256 => mapping(address => bool)) private influencersApproved;
    // mapping influencer address to his rejected campaigns
    mapping(uint256 => mapping(address => bool)) private influencersRejected;
    // mapping influencer address to his submitted posts
    mapping(uint256 => mapping(address => string)) private influencersSubmittedPosts;
    mapping(address => uint256) private s_proceeds;


    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _minimumEngagementRate,
        uint256 _budget
    ) public payable {
        Campaign memory campaign = Campaign(
            _name,
            _description,
            _minimumEngagementRate,
            _budget,
            payable(msg.sender),
            true
        );

        campaigns.push(campaign);

        // fund the contract with the budget
        require(msg.value == _budget, "Budget is not equal to msg.value");
        require(msg.sender.balance >= _budget, "Not enough balance");
        (bool success, ) = payable(address(this)).call{value: _budget}("");

        emit CampaignCreated(
            _name,
            _description,
            _minimumEngagementRate,
            _budget,
            msg.sender
        );
    }

    // get campaign by id
    function getCampaign(uint256 _id)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256,
            address,
            bool
        )
    {
        Campaign memory campaign = campaigns[_id];
        return (
            campaign.name,
            campaign.description,
            campaign.minimumEngagementRate,
            campaign.budget,
            campaign.company,
            campaign.isActive
        );
    }

    // get all campaigns
    function getAllCampaigns()
        public
        view
        returns (
            string[] memory,
            string[] memory,
            uint256[] memory,
            uint256[] memory,
            address[] memory,
            bool[] memory
        )
    {
        uint256 length = campaigns.length;
        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        uint256[] memory minimumEngagementRates = new uint256[](length);
        uint256[] memory budgets = new uint256[](length);
        address[] memory companies = new address[](length);
        bool[] memory isActive = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            Campaign memory currentCampaign = campaigns[i];
            names[i] = currentCampaign.name;
            descriptions[i] = currentCampaign.description;
            minimumEngagementRates[i] = currentCampaign.minimumEngagementRate;
            budgets[i] = currentCampaign.budget;
            companies[i] = currentCampaign.company;
            isActive[i] = currentCampaign.isActive;
        }

        return (
            names,
            descriptions,
            minimumEngagementRates,
            budgets,
            companies,
            isActive
        );
    }
  
    function updateCampaign(uint256 _id, uint256 _budget) public {
        Campaign storage campaign = campaigns[_id];
        require(campaign.company == msg.sender, "Not the owner of this campaign");
        campaign.budget = _budget;
    }


    function approveInfluencer(uint256 _campaignId, address _influencerId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.company == msg.sender, "Not the owner of this campaign");
        require(campaign.isActive == true, "Campaign is not active");
        require(campaign.budget > 0, "Campaign budget is 0");

        influencersApproved[_campaignId][_influencerId] = true;

        emit InfluencerApproved(
            _campaignId,
            _influencerId
        );
    }

    function rejectInfluencer(uint256 _campaignId, address _influencerId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.company == msg.sender, "Not the owner of this campaign");
        require(campaign.isActive == true, "Campaign is not active");

        influencersRejected[_campaignId][_influencerId] = true;

        emit InfluencerRejected(
            _campaignId,
            _influencerId
        );
    }

    function applyToCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(campaign.isActive == true, "Campaign is not active");
        require(campaign.budget > 0, "Campaign budget is 0");
        // check if influencer statistics are good enough
        require(influencerStatistic[msg.sender].avgEngagementRate >= campaign.minimumEngagementRate, "Influencer engagement rate is not good enough");


        influencersApplied[_id][msg.sender] = true;

        emit InfluencerApplied(
            _id,
            msg.sender
        );
    }

    function submitPost(uint256 _campaignId, string memory _instagramPostID) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isActive == true, "Campaign is not active");
        require(campaign.budget > 0, "Campaign budget is 0");
        require(influencersApproved[_campaignId][msg.sender] == true, "Influencer is not approved for this campaign");

        influencersSubmittedPosts[_campaignId][msg.sender] = _instagramPostID;

        emit PostSubmitted(
            _campaignId,
            msg.sender,
            _instagramPostID
        );
    }
    
    function importStatistics (uint256 _avgEngagmentRate, uint256 _avgViews) public {
        InfluencerStatistic storage statistic = influencerStatistic[msg.sender];

        statistic.avgEngagementRate = _avgEngagmentRate;
        statistic.numberOfCampaigns = 0;
        statistic.avgViews = _avgViews;
    }

    function createCampaignData(address _influencer, uint256 _campaign_id, uint256 _engagementRate, uint256 _views) public {
        InfluencerHistory memory history = InfluencerHistory(_campaign_id, _engagementRate, _views, block.timestamp);
        influencerHistory[_influencer].push(history);

        // update influencer statistic
        InfluencerStatistic storage statistic = influencerStatistic[_influencer];
        statistic.avgEngagementRate = (statistic.avgEngagementRate * statistic.numberOfCampaigns + _engagementRate) / (statistic.numberOfCampaigns + 1);
        statistic.numberOfCampaigns = statistic.numberOfCampaigns + 1;
        statistic.avgViews = (statistic.avgViews * statistic.numberOfCampaigns + _views) / (statistic.numberOfCampaigns + 1);
    
        emit UpdatedStatistics(
            _influencer,
            statistic.avgEngagementRate,
            statistic.numberOfCampaigns,
            statistic.avgViews
        );
    }

    function payInfluencer(uint256 _campaignId, address _influencerId, uint256 _engagementRate, uint256 _views) public {
        Campaign storage campaign = campaigns[_campaignId];
        //require(campaign.company == msg.sender, "Not the owner of this campaign");
        require(campaign.isActive == true, "Campaign is not active");
        require(campaign.budget > 0, "Campaign budget is 0");
        require(influencersApplied[_campaignId][_influencerId] == true, "Influencer is not approved for this campaign");

        uint256 influencerPayment = (campaign.budget * _engagementRate) / 100;
        campaign.budget = campaign.budget - influencerPayment;
        
        s_proceeds[_influencerId] += influencerPayment;

        emit InfluencerPaid(
            _campaignId,
            _influencerId,
            _engagementRate,
            _views,
            influencerPayment
        );
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");

        emit withdraw(msg.sender, proceeds);
    }

    function getInfluencerStatistic() public view returns (uint256, uint256, uint256) {
        InfluencerStatistic memory statistic = influencerStatistic[msg.sender];
        return (statistic.avgEngagementRate, statistic.numberOfCampaigns, statistic.avgViews);
    }

}
