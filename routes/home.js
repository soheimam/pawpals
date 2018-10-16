const express = require('express');
const router = express.Router();

//render landingpage
const get = (req, res) => {
  const userSession = req.session.user;
  console.log(userSession);
  res.render('index', { userSession });
};

module.exports = router.get('/', get);
