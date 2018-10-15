const express = require('express');
const { User } = require('../models');
//requiring json data for select dropdowns
const nlRegions = require('../data/json/nlregions.json');
const router = express.Router();

const get = (req, res) => {
  const regions = nlRegions.regions;
  const message = req.query.message;
  res.render('signup', { regions, message });
};

module.exports = router.get('/', get);
