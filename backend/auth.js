const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const ENCRYPTION_KEY = '9cF7Gk2MZpQ8XvT5LbR3NdYqWjK6HsA4'; 

function decrypt(encryptedText) {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':'); 
    const iv = Buffer.from(ivHex, 'hex'); 
    const encrypted = Buffer.from(encryptedHex, 'hex'); 

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8'); 

    return decrypted; 
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null; 
  }
}

router.get('/auth', (req, res) => {
  const encryptedToken = req.cookies?.auth; 
  if (!encryptedToken) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decryptedToken = decrypt(encryptedToken);
    if (!decryptedToken) {
      throw new Error('Invalid or corrupted token');
    }

    if (decryptedToken === 'true') {
      return res.status(200).json({ message: 'Valid token', authenticated: true });
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Invalid token or authentication failed.' });
  }
});

module.exports = router;