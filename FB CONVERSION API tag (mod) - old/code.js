/*
Modified Conversion API Tag by Facebookincubator which sends data to BigQuery project
*/

const getAllEventData = require('getAllEventData');
const getType = require('getType');
const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const Math = require('Math');
const getTimestampMillis = require('getTimestampMillis');
const sha256Sync = require('sha256Sync');
const getCookieValues = require('getCookieValues');
const setCookie = require('setCookie');
const decodeUriComponent = require('decodeUriComponent');
const parseUrl = require('parseUrl');
const computeEffectiveTldPlusOne = require('computeEffectiveTldPlusOne');

const BigQuery = require('BigQuery'); // BQ modification
const queryPermission = require('queryPermission'); // BQ modification
const logToConsole = require('logToConsole'); // BQ modification

// Constants
const API_ENDPOINT = 'https://graph.facebook.com';
const API_VERSION = 'v16.0';
const PARTNER_AGENT = 'gtmss-1.0.0-0.0.8';
const GTM_EVENT_MAPPINGS = {
  "add_payment_info": "AddPaymentInfo",
  "add_to_cart": "AddToCart",
  "add_to_wishlist": "AddToWishlist",
  "gtm.dom": "PageView",
  "page_view": "PageView",
  "purchase": "Purchase",
  "search": "Search",
  "begin_checkout": "InitiateCheckout",
  "generate_lead": "Lead",
  "view_item": "ViewContent",
  "sign_up": "CompleteRegistration"
};

function isAlreadyHashed(input){
  return input && (input.match('^[A-Fa-f0-9]{64}$') != null);
}

function setFbCookie(name, value, expire) {
  setCookie(name, value, {
    domain: 'auto',
    path: '/',
    samesite: 'Lax',
    secure: true,
    'max-age': expire || 7776000, // default to 90 days
    httpOnly: false
  });
}

function getFbcValue() {
  let fbc = eventModel['x-fb-ck-fbc'] || getCookieValues('_fbc', true)[0];
  const url = eventModel.page_location;
  const subDomainIndex = url ? computeEffectiveTldPlusOne(url).split('.').length - 1 : 1;
  const parsedUrl = parseUrl(url);

  if (parsedUrl && parsedUrl.searchParams.fbclid) {
    fbc = 'fb.' + subDomainIndex + '.' + getTimestampMillis() + '.' + decodeUriComponent(parsedUrl.searchParams.fbclid);
  }

  return fbc;
}

function hashFunction(input){
  const type = getType(input);

  if(type == 'undefined' || input == 'undefined') {
    return undefined;
  }

  if(input == null || isAlreadyHashed(input)){
    return input;
  }

  return sha256Sync(input.trim().toLowerCase(), {outputEncoding: 'hex'});
}

function getContentFromItems(items) {
    return items.map(item => {
        return {
            "id": item.item_id  || item.item_name,
            "item_price": item.price,
            "quantity": item.quantity,
        };
    });
}

function getFacebookEventName(gtmEventName) {
  return GTM_EVENT_MAPPINGS[gtmEventName] || gtmEventName;
}

const eventModel = getAllEventData();
const event = {};
event.event_name = getFacebookEventName(eventModel.event_name);
event.event_time = eventModel.event_time || (Math.round(getTimestampMillis() / 1000));
event.event_id = eventModel.event_id;
event.event_source_url = eventModel.page_location;
if(eventModel.action_source || data.actionSource) {
  event.action_source = eventModel.action_source ? eventModel.action_source : data.actionSource;
}

event.user_data = {};
// Default Tag Parameters
event.user_data.client_ip_address = eventModel.ip_override;
event.user_data.client_user_agent = eventModel.user_agent;


// Commmon Event Schema Parameters
event.user_data.em = eventModel['x-fb-ud-em'] ||
                        (eventModel.user_data != null ? hashFunction(eventModel.user_data.email_address) : null);
event.user_data.ph = eventModel['x-fb-ud-ph'] ||
                        (eventModel.user_data != null ? hashFunction(eventModel.user_data.phone_number) : null);

const addressData = (eventModel.user_data != null && eventModel.user_data.address != null) ? eventModel.user_data.address : {};
event.user_data.fn = eventModel['x-fb-ud-fn'] || hashFunction(addressData.first_name);
event.user_data.ln = eventModel['x-fb-ud-ln'] || hashFunction(addressData.last_name);
event.user_data.ct = eventModel['x-fb-ud-ct'] || hashFunction(addressData.city);
event.user_data.st = eventModel['x-fb-ud-st'] || hashFunction(addressData.region);
event.user_data.zp = eventModel['x-fb-ud-zp'] || hashFunction(addressData.postal_code);
event.user_data.country = eventModel['x-fb-ud-country'] || hashFunction(addressData.country);

// Conversions API Specific Parameters
event.user_data.ge = eventModel['x-fb-ud-ge'];
event.user_data.db = eventModel['x-fb-ud-db'];
event.user_data.external_id = eventModel['x-fb-ud-external_id'];
event.user_data.subscription_id = eventModel['x-fb-ud-subscription_id'];
event.user_data.fbp = eventModel['x-fb-ck-fbp'] || getCookieValues('_fbp', true)[0];
event.user_data.fbc = getFbcValue();
event.user_data.fb_login_id = eventModel['x-fb-ud-fb-login-id'] || (eventModel.user_data != null ? eventModel.user_data.fb_login_id : null);


event.custom_data = {};
event.custom_data.currency = eventModel.currency;
event.custom_data.value = eventModel.value;
event.custom_data.search_string = eventModel.search_term;
event.custom_data.order_id = eventModel.transaction_id;
event.custom_data.content_category = eventModel['x-fb-cd-content_category'];
event.custom_data.content_ids = eventModel['x-fb-cd-content_ids'];
event.custom_data.content_name = eventModel['x-fb-cd-content_name'];
event.custom_data.content_type = eventModel['x-fb-cd-content_type'];
const invalidString = "[object Object]";
event.custom_data.contents = (eventModel['x-fb-cd-contents'] != null && eventModel['x-fb-cd-contents'].indexOf(invalidString) == 0 ? null : (typeof(eventModel['x-fb-cd-contents']) == "string" ? JSON.parse(eventModel['x-fb-cd-contents']) : eventModel['x-fb-cd-contents'])) || (eventModel.items != null ? getContentFromItems(eventModel.items) : null);

const customProperties = (eventModel.custom_properties != null) ? (eventModel.custom_properties.indexOf(invalidString) == 0 ? null : (typeof(eventModel.custom_properties) == "string" ?JSON.parse(eventModel.custom_properties) : eventModel.custom_properties))  : {};
for (const property in customProperties) {
    event.custom_data[property] = customProperties[property];
}
event.custom_data.num_items = eventModel['x-fb-cd-num_items'];
event.custom_data.predicted_ltv = eventModel['x-fb-cd-predicted_ltv'];
event.custom_data.status = eventModel['x-fb-cd-status'];
event.custom_data.delivery_category = eventModel['x-fb-cd-delivery_category'];

const eventRequest = {data: [event], partner_agent: PARTNER_AGENT};

if(eventModel.test_event_code || data.testEventCode) {
  eventRequest.test_event_code = eventModel.test_event_code ? eventModel.test_event_code : data.testEventCode;
}

// BigQuery Modification
function bigQuery(status, response) {
  if (data.projectId && data.datasetId && data.tableId) {
    const bqEvent = {};
    bqEvent.channelName = "facebook";
    bqEvent.pixelId = data.pixelId;
    bqEvent.eventTime = event.event_time;
    bqEvent.eventName = event.event_name;
    bqEvent.eventId = event.event_id;
    bqEvent.pageLocation = event.event_source_url;
    bqEvent.statusCode = status.toString();
    bqEvent.response = response;
    bqEvent.actionSource = event.action_source;
    bqEvent.clientIpAddress = event.user_data.client_ip_address;
    bqEvent.clientUserAgent = event.user_data.client_user_agent;
    bqEvent.email = event.user_data.em;
    bqEvent.phone = event.user_data.ph;
    bqEvent.firstName = event.user_data.fn;
    bqEvent.lastName = event.user_data.ln;
    bqEvent.city = event.user_data.ct;
    bqEvent.street = event.user_data.st;
    bqEvent.zip = event.user_data.zp;
    bqEvent.country = event.user_data.country;
    bqEvent.gender = event.user_data.ge;
    bqEvent.dateOfBirth = event.user_data.db;
    bqEvent.externalId = event.user_data.external_id;
    bqEvent.subscriptionId = event.user_data.subscription_id;
    bqEvent.fbp = event.user_data.fbp;
    bqEvent.fbc = event.user_data.fbc;
    bqEvent.currency = event.custom_data.currency;
    bqEvent.value = event.custom_data.value;
    bqEvent.searchTerm = event.custom_data.search_string;
    bqEvent.transactionId = event.custom_data.order_id;
    bqEvent.contentCategory = event.custom_data.content_category;
    bqEvent.numItems = event.custom_data.num_items;
    bqEvent.contentIds = event.custom_data.content_ids;
    bqEvent.contentName = event.custom_data.content_name;
    bqEvent.contentType = event.custom_data.content_type;
    bqEvent.contents = event.custom_data.contents;
    bqEvent.deliveryCategory = event.custom_data.delivery_category;
    bqEvent.predictedLTV = event.custom_data.predicted_ltv;
    bqEvent.status = event.custom_data.status;
    
    const connectionInfo = {
      projectId: data.projectId,
      datasetId: data.datasetId,
      tableId: data.tableId,
    };
    
    BigQuery.insert(
      connectionInfo,
      [bqEvent], {}, () => {
        logToConsole('BigQuery Success');
      }, (errors) => {
        logToConsole('BigQuery Failure');
        logToConsole(JSON.stringify(errors));
      });
  }
}


// Posting to Conversions API
const routeParams = 'events?access_token=' + data.apiAccessToken;
const graphEndpoint = [API_ENDPOINT,
                       API_VERSION,
                       data.pixelId,
                       routeParams].join('/');

const requestHeaders = {headers: {'content-type': 'application/json'}, method: 'POST'};
sendHttpRequest(
  graphEndpoint,
  (statusCode, headers, response) => {
    if (statusCode >= 200 && statusCode < 300) {
      if (data.extendCookies && event.user_data.fbc) {
        setFbCookie('_fbc', event.user_data.fbc);
      }

      if (data.extendCookies && event.user_data.fbp) {
        setFbCookie('_fbp', event.user_data.fbp);
      }
      
      bigQuery(statusCode, response); //BigQuery modification
      data.gtmOnSuccess();
    } else {
      bigQuery(statusCode, response); //BigQuery modification
      data.gtmOnFailure();
    }
  },
  requestHeaders,
  JSON.stringify(eventRequest)
);