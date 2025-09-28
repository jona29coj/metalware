const express = require('express');
const pool = require('./db.js');
const moment = require('moment-timezone');
const router = express.Router();

router.post('/logout', async (req,res) => {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
        return res.status(400).json({ message: 'No session found'});
    }

    const currentTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    pool.query(
        'UPDATE user_sessions SET logout_time = ? WHERE session_id = ?',
        [currentTime, sessionId],
        (err) => {
            if (err) {
                console.error('Error logging out:', err.message);
                return res.status(500).json({ message: 'Database error'});
            }
            res.clearCookie('sessionId', {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                domain: '.elementsenergies.com',
                path: '/',
            });

            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                domain: ".elementsenergies.com",
                path: "/",
              });
              
            res.status(200).json({ message: 'Logged out successfully'})
        }
    )
})

module.exports = router;