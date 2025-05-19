const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
});

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
  const encryptedCookie = req.cookies?.authData; 
  if (!encryptedCookie) {
    return res.status(401).json({ message: 'Access Denied. No cookie provided.' });
  }

  try {
    const decryptedData = decrypt(encryptedCookie);
    if (!decryptedData) {
      throw new Error('Invalid or corrupted cookie');
    }
    const cookieData = JSON.parse(decryptedData);

    if (cookieData.auth !== "true") {
      return res.status(401).json({ message: 'Invalid authentication token.'})
    }

    return res.status(200).json({
      message: 'Valid token',
      authenticated: true,
      username: cookieData.username,
      deviceName: cookieData.deviceName,
      ipAddress: cookieData.ipAddress,
    });
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Invalid token or authentication failed.' });
  }
});

module.exports = router;