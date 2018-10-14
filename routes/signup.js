const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

//requiring json data for select dropdowns
const nlRegions = require('../data/json/nlregions.json');

module.exports = User => {
  const get = (req, res) => {
    const regions = nlRegions.regions;
    const message = req.query.message;
    res.render('signup', { regions, message });
  };

  return router.get('/', get);
};
