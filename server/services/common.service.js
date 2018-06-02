'use strict';

import config from '../config';
import _ from 'lodash'

export function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}


export const getHunterCoupons = async (models, hunterId) => {
  const hunter = await models.Hunter
                            .findOne({_id: hunterId})
                            .populate('coupons') || {}

  return hunter.coupons || [];
}

export const getCampaignsSelectedByMe = async (models, myCoupons) => {
  const campaigns = await models.Campaign
    .find({
      coupons: {
        '$in': myCoupons
      }
    })
    .populate('coupons');

  return campaigns
}

export const mapCampaignsWithTotalOfCouponsHuntedByMe = (campaignsSelectedByMe, myCoupons) => {
  let campaigns = {};
  const myHuntedCoupons = _.filter(myCoupons, {status: config.couponStatus.HUNTED})
  const myRedeemedCoupons = _.filter(myCoupons, {status: config.couponStatus.REDEEMED})
  for(let i = 0; i < campaignsSelectedByMe.length; i++) {
    const campaign = campaignsSelectedByMe[i];
    const couponsHuntedInThisCampaign = _.intersectionBy(campaign.coupons, myHuntedCoupons, 'id');
    const couponsRedeemedInThisCampaign = _.intersectionBy(campaign.coupons, myRedeemedCoupons, 'id');
    campaigns[campaign.id] = {
      couponsHunted: couponsRedeemedInThisCampaign.length + couponsHuntedInThisCampaign.length,
      couponsRedeemed: couponsRedeemedInThisCampaign.length
    }
  }
  return campaigns;
}

export const addCouponsHuntedByMeToCampaigns = (allSortedCampaigns, myCampaigns, campaignsWithCouponsSelected) => {
  let campaigns = [];
  for (let i = 0; i < allSortedCampaigns.length; i++) {
    let campaign = allSortedCampaigns[i];
    const isMyCampaign = findHuntedCampaign(campaign.id, myCampaigns);
    if (isMyCampaign) {
      campaign.couponsHuntedByMe = campaignsWithCouponsSelected[campaign.id].couponsHunted;
      campaign.couponsRedeemedByMe = campaignsWithCouponsSelected[campaign.id].couponsRedeemed;
    } else {
      campaign.couponsHuntedByMe = 0;
      campaign.couponsRedeemedByMe = 0;
    }
    const couponsWereRedeemed = (campaign.couponsHuntedByMe === campaign.couponsRedeemedByMe);
    const campaignIsAvailable = campaign.status === config.campaignStatus.AVAILABLE;
    campaign.canHunt = (couponsWereRedeemed && campaignIsAvailable);

    campaigns.push(campaign);
  }
  return campaigns;
}

function findHuntedCampaign(campaignId, myCampaigns) {
  return myCampaigns.find(mycampaign => {
    return mycampaign.id === campaignId;
  });
}


