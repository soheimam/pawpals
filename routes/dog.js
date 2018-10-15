const express = require('express');
const router = express.Router();
const { User, Dog } = require('../models');
//requiring json data for select dropdowns
const dogBreeds = require('../data/json/breeds.json');

const getDogProfile = (req, res) => {
  const userSession = req.session.user;
  const dogId = req.params.id;
  Dog.findAll({
    where: {
      id: dogId,
    },
  }).then(dog => {
    const dogData = dog[0];
    res.render('dog-profile', { dog: dogData });
  });
};

const newDogGET = (req, res) => {
  const breeds = dogBreeds.dogs;
  res.render('create-dog-profile', { breeds });
};

const newDogPOST = (req, res) => {
  const userEmail = req.session.user.email;
  const user = req.session.user;
  User.findOne({
    where: {
      email: userEmail,
    },
  })
    .then(user => {
      //populate dog table with user relation
      return user.createDog({
        name: req.body.name,
        breed: req.body.breed,
        age: req.body.age,
        gender: req.body.gender,
        description: req.body.description,
      });
    })
    .then(dog => {
      res.redirect(`/dog/${dog.id}`);
    })
    .catch(err => {
      console.log(err);
    });
};

const editDogGET = (req, res) => {
  const breeds = dogBreeds.dogs;
  const dogId = req.params.id;
  res.render('edit-dog-profile', { breeds, dogId });
};

const editDog = (req, res) => {
  const dogId = req.params.id;
  Dog.update(
    {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
      description: req.body.description,
    },
    {
      where: {
        id: dogId,
      },
    }
  ).then(() => {
    res.redirect(`/dog/${dogId}`);
  });
};

const deleteDog = (req, res) => {
  const userSession = req.session.user;
  const dogId = req.params.id;

  Dog.destroy({
    where: {
      id: dogId,
    },
  }).then(dog => {
    res.redirect(
      `/user/${userSession.id}?message=${encodeURIComponent(
        'Dog was successfully deleted'
      )}`
    );
  });
};

module.exports = router
  .get('/new', newDogGET)
  .post('/new', newDogPOST)
  .get('/:id', getDogProfile)
  .get('/:id/edit', editDogGET)
  .post('/:id/edit', editDog)
  .post('/:id/delete', deleteDog);
