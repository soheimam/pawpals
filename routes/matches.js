const express = require('express');
const router = express.Router();
const { User, Dog, Match } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

const getMatchReq = (req, res) => {
  const userSession = req.session.user || {};
  const userSessionId = userSession.id;
  const message = req.query.message;
  Match.findAll({
    where: {
      iDofUserThatLiked: {
        [Op.ne]: userSession.id,
      },
      status: 'pending',
    },
    required: false,
    include: [{ model: Dog }],
  }).then(matches => {
    res.render('matchReq', { matches, userSession });
  });
};

module.exports = router.post('/', matchDogs).get('/request', getMatchReq);
