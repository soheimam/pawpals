const express = require('express');
const router = express.Router();

const get = (req, res) => {
  req.session.destroy(error => {
    if (error) {
      throw error;
    }
    res.redirect(`/?message=${encodeURIComponent('You are logged out.')}`);
  });
};

module.exports = router.get('/', get);
