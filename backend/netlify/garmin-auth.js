// Garmin OAuth Authentication Handler
// Handles OAuth 1.0a flow for Garmin Connect API

const crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action } = JSON.parse(event.body || '{}');

    // Step 1: Request Token
    if (action === 'requestToken') {
      const consumerKey = process.env.GARMIN_CONSUMER_KEY;
      const consumerSecret = process.env.GARMIN_CONSUMER_SECRET;
      const callbackUrl = process.env.GARMIN_CALLBACK_URL;

      // Generate OAuth 1.0a signature
      const oauth = {
        oauth_consumer_key: consumerKey,
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0',
        oauth_callback: callbackUrl
      };

      // Garmin request token endpoint
      const requestTokenUrl = 'https://connectapi.garmin.com/oauth-service/oauth/request_token';

      // Generate signature
      const signatureBase = generateSignatureBase('POST', requestTokenUrl, oauth);
      const signingKey = `${consumerSecret}&`;
      const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

      oauth.oauth_signature = signature;

      // Make request to Garmin
      const response = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': generateAuthHeader(oauth)
        }
      });

      const data = await response.text();
      const params = new URLSearchParams(data);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token: params.get('oauth_token'),
          tokenSecret: params.get('oauth_token_secret'),
          authUrl: `https://connect.garmin.com/oauthConfirm?oauth_token=${params.get('oauth_token')}`
        })
      };
    }

    // Step 2: Exchange for Access Token
    if (action === 'accessToken') {
      const { oauthToken, oauthVerifier, tokenSecret } = JSON.parse(event.body);
      
      const consumerKey = process.env.GARMIN_CONSUMER_KEY;
      const consumerSecret = process.env.GARMIN_CONSUMER_SECRET;

      const oauth = {
        oauth_consumer_key: consumerKey,
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0',
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier
      };

      const accessTokenUrl = 'https://connectapi.garmin.com/oauth-service/oauth/access_token';
      const signatureBase = generateSignatureBase('POST', accessTokenUrl, oauth);
      const signingKey = `${consumerSecret}&${tokenSecret}`;
      const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

      oauth.oauth_signature = signature;

      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': generateAuthHeader(oauth)
        }
      });

      const data = await response.text();
      const params = new URLSearchParams(data);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          accessToken: params.get('oauth_token'),
          accessSecret: params.get('oauth_token_secret')
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    console.error('Garmin auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

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
