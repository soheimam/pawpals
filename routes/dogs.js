const express = require('express');
const router = express.Router();
const { User, Dog, Match, Conversation } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//requiring json data for select dropdowns
const dogBreeds = require('../data/json/breeds.json');
const breeds = dogBreeds.dogs;

const getAllDogs = (req, res) => {
  const userSession = req.session.user || {};
  const breed = req.query.breed || '';
  const gender = req.query.gender || '';
  const age = req.query.age || '';

  const options = {
    where: {},
    include: [
      {
        model: User,
      },
      {
        model: Match,
        where: { iDofUserThatLiked: userSession.id },
        required: false,
      },
      {
        model: Conversation,
        where: {
          [Op.or]: [{ ownerId: userSession.id }, { userId: userSession.id }],
        },
        required: false,
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
    res.render('gallery', { dogs, breeds, breed, age, gender, userSession });
  });
};

const matchDogs = (req, res) => {
  const likedDog = req.body.dogId;
  const likedDogOwner = req.body.ownerId;
  const userSession = req.session.user || {};
  const fullnameofuserthatliked = `${req.session.user.firstname} ${
    req.session.user.lastname
  }`;

  Match.create({
    iDofUserThatLiked: req.session.user.id,
    nameOfUserThatLiked: fullnameofuserthatliked,
    dogId: likedDog,
    userId: likedDogOwner,
    status: 'pending',
  }).then(() => {
    res.redirect('/dogs');
  });
};

module.exports = router.get('/', getAllDogs).post('/match', matchDogs);
