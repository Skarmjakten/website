/* eslint-disable */
'use strict';

const https = require('https');

/**
 * Makes a POST request to the given HTTPS endpoint and returns the parsed JSON body.
 */
function postJson(hostname, path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'Skarmjakten-Admin/1.0',
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => { chunks += c; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(chunks));
          } catch (e) {
            reject(new Error('Invalid JSON response from GitHub'));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Netlify Function: GitHub OAuth handler.
 *
 * Two modes:
 *  - No "code" query param → redirect user to GitHub OAuth authorisation page.
 *  - With "code" query param → exchange code for access token, then redirect to
 *    /admin/#token=<access_token> so the token never touches the server logs.
 *
 * Required environment variables (set in Netlify site settings):
 *   GITHUB_CLIENT_ID     – OAuth App client ID
 *   GITHUB_CLIENT_SECRET – OAuth App client secret
 */
exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: 'Server misconfiguration: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set.',
    };
  }

  // ── Step 1: No code → redirect to GitHub OAuth ──────────────────────────────
  if (!params.code) {
    const authUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&scope=public_repo` +
      `&allow_signup=false`;

    return {
      statusCode: 302,
      headers: { Location: authUrl },
      body: '',
    };
  }

  // ── Step 2: Exchange code for access token ───────────────────────────────────
  try {
    const tokenData = await postJson('github.com', '/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code: params.code,
    });

    if (tokenData.error) {
      const msg = tokenData.error_description || tokenData.error;
      return {
        statusCode: 302,
        headers: {
          Location: `/admin/?error=${encodeURIComponent(msg)}`,
        },
        body: '',
      };
    }

    // Put the token in the URL fragment so it is never sent to the server
    return {
      statusCode: 302,
      headers: {
        Location: `/admin/#token=${tokenData.access_token}`,
      },
      body: '',
    };
  } catch (err) {
    return {
      statusCode: 302,
      headers: {
        Location: `/admin/?error=${encodeURIComponent('OAuth exchange failed: ' + err.message)}`,
      },
      body: '',
    };
  }
};
