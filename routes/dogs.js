const express = require('express');
const router = express.Router();
const { User, Dog } = require('../models');
//requiring json data for select dropdowns
const dogBreeds = require('../data/json/breeds.json');
const breeds = dogBreeds.dogs;

const getAllDogs = (req, res) => {
  const userSession = req.session.user;
  Dog.findAll().then(dogs => {
    res.render('gallery', { dogs, breeds });
  });
};
const filterDogs = (req, res) => {
  const userSession = req.session.user;
  let breed = req.body.breed;
  let age = req.body.age;
  let gender = req.body.gender;
  let options = { where: {} };
  if (breed) {
    if (breed !== 'all') {
      options.where.breed = breed;
    }
  }
  if (age) {
    options.where.age = age;
  }
  if (gender) {
    if (gender !== 'all') {
      options.where.gender = gender;
    }
  }
  Dog.findAll(options).then(dogs => {
    console.log(dogs);
    res.render('gallery', { dogs, breeds });
  });
};
module.exports = router.get('/all', getAllDogs).post('/all', filterDogs);
