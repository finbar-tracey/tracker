// Whoop Data Sync Handler
// Fetches health data from Whoop API v2

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
    const { accessToken, startDate, endDate } = JSON.parse(event.body);

    if (!accessToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing access token' })
      };
    }

    const baseUrl = 'https://api.prod.whoop.com/developer/v1';

    // Fetch user profile
    const profile = await fetchWhoopData(`${baseUrl}/user/profile/basic`, accessToken);

    // Fetch recovery data
    const recovery = await fetchWhoopData(`${baseUrl}/recovery?start=${startDate}&end=${endDate}`, accessToken);

    // Fetch sleep data
    const sleep = await fetchWhoopData(`${baseUrl}/activity/sleep?start=${startDate}&end=${endDate}`, accessToken);

    // Fetch workout data
    const workout = await fetchWhoopData(`${baseUrl}/activity/workout?start=${startDate}&end=${endDate}`, accessToken);

    // Fetch cycle data (strain)
    const cycle = await fetchWhoopData(`${baseUrl}/cycle?start=${startDate}&end=${endDate}`, accessToken);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          profile,
          recovery,
          sleep,
          workout,
          cycle
        },
        syncedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Whoop sync error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function fetchWhoopData(url, accessToken) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Whoop API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return null;
  }
}
