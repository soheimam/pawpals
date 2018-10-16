const express = require('express');
const router = express.Router();

//render landingpage
const get = (req, res) => {
  const userSession = req.session.user;
  res.render('index', { userSession });
};

module.exports = router.get('/', get);
