// api-config.js
// import { COMMON_API_BASE_URL } from './api.js'; // compiled JS path

/**
 * Client-side API Configuration
 */
const COMMON_API_BASE_URL = 'https://www.gstv.in/backend2/api/v13/mobile';
const API_CONFIG = {
  COMMON_API_BASE_URL,

  ENDPOINTS: {
    TOP_NEWS: `${COMMON_API_BASE_URL}/topnewsweb`,
    CATEGORY_NEWS: `${COMMON_API_BASE_URL}/categorynews`,
    TOP_HOME_CATEGORY: `${COMMON_API_BASE_URL}/tophomecategoryweb`,
    TOP_VIDEOS: `${COMMON_API_BASE_URL}/topVideos`,
    NEWS_DETAIL: `${COMMON_API_BASE_URL}/newsdetail`,

    UPDATE_PROFILE: `${COMMON_API_BASE_URL}/updateprofile`,
    VIEW_PROFILE: `${COMMON_API_BASE_URL}/viewProfile`,
    USER_DELETEACCOUNT: `${COMMON_API_BASE_URL}/deleteAccount`,

    CITIES: `${COMMON_API_BASE_URL}/citylist`,
    GET_ALL_CITY: `${COMMON_API_BASE_URL}/getallCity`,

    TOP_WEB_STORY: `${COMMON_API_BASE_URL}/topwebstory`,
    WEB_STORY_DETAIL: `${COMMON_API_BASE_URL}/webstorydetail`,
    WEB_STORY_LIST: `${COMMON_API_BASE_URL}/webstory`,

    EPAPER_LIST: `${COMMON_API_BASE_URL}/epaper`,
    EPAPER_DETAIL: `${COMMON_API_BASE_URL}/epaperdetail`,
    EPAPER_BY_DATE: `${COMMON_API_BASE_URL}/epaper`,

    CATEGORY_SETTING: `${COMMON_API_BASE_URL}/categorysettingweb`,
    CATEGORY_SETTINGUSER: `${COMMON_API_BASE_URL}/categorysettingbyuser`,

    SEARCH: `${COMMON_API_BASE_URL}/search`,
    SEARCH_RESULT: `${COMMON_API_BASE_URL}/searchresult`,

    BOOKMARK: `${COMMON_API_BASE_URL}/bookmark`,
    NEWS_BOOKMARK: `${COMMON_API_BASE_URL}/newsbookmark`,
    SHARE: `${COMMON_API_BASE_URL}/share`,
    USER_CATEGORY: `${COMMON_API_BASE_URL}/usercategory`,
    USER_CITY: `${COMMON_API_BASE_URL}/usercity`,
    GET_CATEGORY_CITY: `${COMMON_API_BASE_URL}/getcategorycity`,

    SEND_OTP: `${COMMON_API_BASE_URL}/sendotp`,
    VERIFY_OTP: `${COMMON_API_BASE_URL}/verifyotp`,
    RESEND_OTP: `${COMMON_API_BASE_URL}/resendotp`,
    VERIFY_MPIN: `${COMMON_API_BASE_URL}/verifyMPIN`,

    POLL: `${COMMON_API_BASE_URL}/poll`,
    POLL_SUBMIT: `${COMMON_API_BASE_URL}/submitpoll`,
    POLL_RESULTS: `${COMMON_API_BASE_URL}/pollResults`,

    GSTV_FAST_TRACK: `${COMMON_API_BASE_URL}/gstvfasttrack`,
    NEWS_NEXT_CONTENT: `${COMMON_API_BASE_URL}/newsnextContent`,
    SATRANG_CATEGORY: `${COMMON_API_BASE_URL}/satrangcategory`,
    BREAKING_NEWS: `${COMMON_API_BASE_URL}/topbreakingnewsWeb`
  }
};

// Helpers
function getApiEndpoint(name) {
  return API_CONFIG.ENDPOINTS[name] ?? null;
}

function getApiBaseUrl() {
  return API_CONFIG.COMMON_API_BASE_URL;
}
// Optional: expose globally if needed
window.API_CONFIG = API_CONFIG;
window.getApiEndpoint = getApiEndpoint;
window.getApiBaseUrl = getApiBaseUrl;

export default API_CONFIG;
