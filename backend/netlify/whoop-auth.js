// Whoop OAuth Authentication Handler
// Handles OAuth 2.0 flow for Whoop API

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
    const { action, code } = JSON.parse(event.body || '{}');

    const clientId = process.env.WHOOP_CLIENT_ID;
    const clientSecret = process.env.WHOOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOOP_REDIRECT_URI;

    // Step 1: Generate authorization URL
    if (action === 'getAuthUrl') {
      const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read:recovery read:sleep read:workout read:profile`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          authUrl: authUrl
        })
      };
    }

    // Step 2: Exchange code for access token
    if (action === 'exchangeToken' && code) {
      const tokenUrl = 'https://api.prod.whoop.com/oauth/oauth2/token';

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`Whoop token exchange failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in
        })
      };
    }

    // Step 3: Refresh access token
    if (action === 'refreshToken') {
      const { refreshToken } = JSON.parse(event.body);

      const tokenUrl = 'https://api.prod.whoop.com/oauth/oauth2/token';

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Whoop token refresh failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    console.error('Whoop auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
