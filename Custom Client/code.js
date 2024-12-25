/* 
    Simple sGTM client with default request path '/custom-client'
*/

const claimRequest = require('claimRequest');
const getRequestPath = require('getRequestPath');
const getRequestBody = require('getRequestBody');
const runContainer = require('runContainer');
const addEventCallback = require('addEventCallback');
const returnResponse = require('returnResponse');
const setResponseStatus = require('setResponseStatus');
const setResponseHeader = require('setResponseHeader');
const logToConsole = require('logToConsole');
const Object = require('Object');
const JSON = require('JSON');

const requestPath = data.requestPath === undefined ? '/custom-client' : '/' + data.requestPath;


if (getRequestPath() === requestPath) {
    claimRequest();

    // Reading the request body and parsing the data
    const requestBody = getRequestBody();
    const event = JSON.parse(requestBody);
    const flattenedEvent = flattenObject(event);
  
    // Running the container for the flattened event
    runContainer(flattenedEvent, (bindToEvent) => {
        bindToEvent(addEventCallback)((containerId, eventData) => {
            
        });
    });
  
    // Creating custom response
    setResponseStatus(200);
    setResponseHeader("message", "Custom client: request successfully processed!");
    returnResponse();
}

// Function to flatten the first level nested objects
function flattenObject(obj) {
    const flattened = {};
    for (const key in obj) {
      if (key === 'event') {
            flattened['event_name'] = obj[key];
        } else if (key === 'ecommerce' && typeof obj[key] === 'object' && obj[key] !== null) {
        for (const nestedKey in obj[key]) {
          flattened[nestedKey] = obj[key][nestedKey];
        }
      } else {
        flattened[key] = obj[key];
      }
    }
    return flattened;
}