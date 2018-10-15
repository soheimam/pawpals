const express = require('express');
const router = express.Router();

//render landingpage
const get = (req, res) => {
  // TODO: Check if session exists. If yes, redirect to user profile and change header to show logout
  res.render('index');
};

module.exports = router.get('/', get);
