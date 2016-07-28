import { createBid } from '../bidfactory';
import { addBidResponse } from '../bidmanager';
import { ajax } from '../ajax';
import { generateUUID, getSizes } from '../utils';
const CONSTANTS = require('../constants.json');

const ENDPOINT = 'http://ib.adnxs.com/ut/v2';

// function/module will be renamed
function UtAdapter() {

  function callBids(params) {
    const tags = params.bids.map(bid => {
      let tag = {};

      const sizes = getSizes(bid.sizes);
      tag.sizes = sizes;
      tag.primary_size = sizes[0];

      tag.uuid = generateUUID();
      tag.id = Number.parseInt(bid.params.placementId);
      tag.prebid = true;
      tag.allow_smaller_sizes = false;
      tag.disable_psa = true;
      tag.ad_types = [0];

      return tag;
    });

    const request = {
      tags: [...tags],
      uuid: generateUUID(),
      member_id: "none"
    };

    const payload = JSON.stringify(request);
    ajax(ENDPOINT, registerResponse, payload);
  }

  function registerResponse(response) {
    for (const tag of JSON.parse(response).tags) {
      const ad = tag.ads[0];
      const bid = createBid(CONSTANTS.STATUS.GOOD);
      bid.code = 'ut';
      bid.bidderCode = 'ut';
      bid.creative_id = ad.creativeId;
      bid.cpm = ad.cpm;
      bid.ad = ad.rtb.banner.content;
      // try {
      //   const url = ad.rtb.trackers[0].impression_urls[0];
      //   const tracker = utils.createTrackPixelHtml(url);
      //   bid.ad += tracker;
      // } catch (e) {
      //   utils.logError('Error appending tracking pixel', 'appnexusAst.js:_requestAds', e);
      // }

      bid.width = ad.rtb.banner.width;
      bid.height = ad.rtb.banner.height;
      addBidResponse(tag.tag_id, bid);
    }
  }

  return {callBids};

}

// using this instead of ES2015 equivalent because `export default` compiles to
// `exports.default`, not `module.exports` as needed in build system
module.exports = UtAdapter;
