const express = require('express');
const router = express.Router();

//render landingpage
const get = (req, res) => {
  res.render('index');
};

module.exports = router.get('/', get);
