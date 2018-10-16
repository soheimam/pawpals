const express = require('express');
const router = express.Router();
const { User, Dog } = require('../models');

const getAllDogs = (req, res) => {
  const userSession = req.session.user;
  Dog.findAll().then(dogs => {
    res.render('gallery', { dogs });
  });
};
module.exports = router.get('/all', getAllDogs);
