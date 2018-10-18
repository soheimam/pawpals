const express = require('express');
const { User } = require('../models');
//requiring json data for select dropdowns
const nlRegions = require('../data/json/nlregions.json');
const router = express.Router();

const get = (req, res) => {
  const regions = nlRegions.regions;
  const message = req.query.message;
  const userSession = req.session.user || {};
  res.render('signup', { regions, message, userSession });
};

module.exports = router.get('/', get);
