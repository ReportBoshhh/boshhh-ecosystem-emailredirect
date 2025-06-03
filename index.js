const express = require('express');
const app = express();

// Home route
app.get('/', (req, res) => {
  res.send('Boshhh verification service is running. Use /verify endpoint with a token.');
});

// Verify endpoint
app.get('/verify', async (req, res) => { 
  const {token, email} = req.query;
  const os = detectMobileOS(req);

  // This Handles Desktop Users 
  if (os === 'Other') {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Open on Mobile</title>
        </head>
        <body>
          <h2>Please open this link on your phone</h2>
          <p>This verification link only works on mobile devices.</p>
        </body>
      </html>
    `);
  }

  // Mobile handling (deep link + token verification)
  const isValid = await verifyTokenWithYourAPI(token, email);
  if (isValid) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="3;url=${getAppStoreLink(os)}">
          <script>
          if ('${os}' === 'iOS') {
          const shouldOpen = confirm("Open in Boshhh app?");
          if (shouldOpen) window.location.href = 'app.boshhh://token/${token}';
          } else {
            window.location.href = 'app.boshhh://token/${token}';
          }
          </script>
        </head>
        <body>
          Redirecting to app... If nothing happens, you'll be redirected to the app store shortly.
        </body>
      </html>
    `);
  } else {
    console.log("Invalid token");
    res.redirect("app.boshhh://");
  }
});

// Helper functions
async function verifyTokenWithYourAPI(token, email) {
  try {    
    const response = await fetch(`https://api.prod.boshhh.com/api/Email/VerifyToken?token=${token}&email=${email}`);
    const data = await response.json();    
    return data;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

// Function to detect mobile OS
function detectMobileOS(req) {
  const userAgent = req.headers['user-agent'] || '';
  return /android/i.test(userAgent) ? 'Android' : /iPad|iPhone|iPod/i.test(userAgent) ? 'iOS' : 'Other';
}

// Function to get the app store link based on the OS
function getAppStoreLink(os) {
  return os === 'iOS' 
    ? 'https://apps.apple.com/gb/app/boshhh/id6446495097'
    : 'https://play.google.com/store/apps/details?id=com.app.boshhh';
}

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
exports.default = app;