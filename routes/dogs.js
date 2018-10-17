const express = require('express');
const router = express.Router();
const { User, Dog } = require('../models');
//requiring json data for select dropdowns
const dogBreeds = require('../data/json/breeds.json');
const breeds = dogBreeds.dogs;

const getAllDogs = (req, res) => {
  const userSession = req.session.user;
  const breed = req.query.breed || '';
  const gender = req.query.gender || '';
  const age = req.query.age || '';

  const options = {
    where: {},
    include: [
      {
        model: User,
      },
    ],
  };

  if (breed && breed !== 'all') {
    options.where.breed = breed;
  }

  if (gender && gender !== 'all') {
    options.where.gender = gender;
  }

  if (age) {
    options.where.age = age;
  }

  Dog.findAll(options).then(dogs => {
    res.render('gallery', { dogs, breeds, breed, age, gender });
  });
};

module.exports = router.get('/', getAllDogs);
