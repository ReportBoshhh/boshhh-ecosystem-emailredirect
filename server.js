// index.js - Main server file
const express = require('express');
const app = express();

// Verify endpoint
app.get('/verify', async (req, res) => {
  const token = req.query.token;
  
  // Step 1: Verify token via API
  const isValid = await verifyTokenWithYourAPI(token); 
  const os = detectMobileOS(req);
  
  // Step 2: Redirect logic
  if (isValid) {
    // Valid token → deep link
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            window.location.href = 'app.boshhh://token/${token}';
            setTimeout(() => {
              window.location.href = '${getAppStoreLink(os)}';
            }, 1000);
          </script>
        </head>
        <body>
          Redirecting to app...
        </body>
      </html>
    `);
  } else {
    // Invalid token → direct to app store
    return res.redirect(getAppStoreLink(os));
  }
});

// Helper functions
async function verifyTokenWithYourAPI(token) {
  try {
    const response = await fetch(`https://api.dev.boshhh.com/api/Email/VerifyToken?token=${token}`);
    const data = await response.json();
    return data.isValid; // Assume API returns { isValid: boolean }
  } catch (error) {
    console.error('Error verifying token:', error);
    return false; // Return false in case of API errors
  }
}

function detectMobileOS(req) {
  const userAgent = req.headers['user-agent'] || '';
  return /android/i.test(userAgent) ? 'Android' : /iPad|iPhone|iPod/i.test(userAgent) ? 'iOS' : 'Other';
}

function getAppStoreLink(os) {
  return os === 'iOS' 
    ? 'https://apps.apple.com/gb/app/boshhh/id6446495097'
    : 'https://play.google.com/store/apps/details?id=com.app.boshhh';
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;