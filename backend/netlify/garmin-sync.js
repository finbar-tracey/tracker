// Garmin Data Sync Handler
// Fetches health data from Garmin Connect API

const crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { accessToken, accessSecret, startDate, endDate } = JSON.parse(event.body);

    if (!accessToken || !accessSecret) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing access credentials' })
      };
    }

    const consumerKey = process.env.GARMIN_CONSUMER_KEY;
    const consumerSecret = process.env.GARMIN_CONSUMER_SECRET;

    // Fetch multiple data types
    const data = {
      sleep: await fetchGarminData('sleep', accessToken, accessSecret, consumerKey, consumerSecret, startDate, endDate),
      heartRate: await fetchGarminData('heartRate', accessToken, accessSecret, consumerKey, consumerSecret, startDate, endDate),
      stress: await fetchGarminData('stress', accessToken, accessSecret, consumerKey, consumerSecret, startDate, endDate),
      bodyBattery: await fetchGarminData('bodyBattery', accessToken, accessSecret, consumerKey, consumerSecret, startDate, endDate),
      steps: await fetchGarminData('steps', accessToken, accessSecret, consumerKey, consumerSecret, startDate, endDate)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data,
        syncedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Garmin sync error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function fetchGarminData(dataType, accessToken, accessSecret, consumerKey, consumerSecret, startDate, endDate) {
  const endpoints = {
    sleep: '/wellness-api/rest/dailies',
    heartRate: '/wellness-api/rest/heartRate',
    stress: '/wellness-api/rest/stress',
    bodyBattery: '/wellness-api/rest/bodyBattery',
    steps: '/wellness-api/rest/dailies'
  };

  const baseUrl = 'https://apis.garmin.com';
  const url = `${baseUrl}${endpoints[dataType]}?uploadStartTimeInSeconds=${startDate}&uploadEndTimeInSeconds=${endDate}`;

  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
    oauth_token: accessToken
  };

  const signatureBase = generateSignatureBase('GET', url, oauth);
  const signingKey = `${consumerSecret}&${accessSecret}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

  oauth.oauth_signature = signature;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': generateAuthHeader(oauth)
      }
    });

    if (!response.ok) {
      throw new Error(`Garmin API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${dataType}:`, error);
    return null;
  }
}

function generateSignatureBase(method, url, params) {
  const sorted = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  return `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sorted)}`;
}

function generateAuthHeader(oauth) {
  const parts = Object.keys(oauth)
    .sort()
    .map(key => `${key}="${encodeURIComponent(oauth[key])}"`)
    .join(', ');
  
  return `OAuth ${parts}`;
}
