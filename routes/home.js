const express = require('express');
const router = express.Router();

//render landingpage
module.exports = () => {
  const get = (req, res) => {
    res.render('index');
  };
  return router.get('/', get);
};
