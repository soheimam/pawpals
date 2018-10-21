const express = require('express');
const router = express.Router();
const { User, Dog, Match, Message, Conversation } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const updateReqStatusPOST = (req, res) => {
  const userId = req.body.userId;
  const iDofUserThatLiked = req.body.userThatRequested;
  const nameThatReq = req.body.nameThatReq;
  const dogId = req.body.dogId;
  const status = req.body.status;
  Match.update(
    {
      status,
    },
    {
      where: {
        iDofUserThatLiked,
        userId,
        dogId,
      },
    }
  )
    .then(() => {
      if (status === 'rejected') {
        return true;
      }
      return Conversation.create({
        ownerId: userId,
        userId: iDofUserThatLiked,
        dogId,
      });
    })
    .then(result => {
      const message =
        status === 'rejected'
          ? `You have rejected a message request from ${nameThatReq}`
          : `Now you can share messages with ${nameThatReq}!!`;
      res.redirect(`/user/${userId}?message=${message}`);
    });
};
const conversationsGet = (req, res) => {
  const userSession = req.session.user;
  Conversation.findAll({
    where: {
      [Op.or]: [{ ownerId: userSession.id }, { userId: userSession.id }],
    },
    include: [
      {
        model: User,
        as: 'owner',
      },
      {
        model: User,
        as: 'user',
      },
      {
        model: Dog,
      },
    ],
  }).then(conversations => {
    console.log(conversations[0].user.firstname);
    console.log(conversations[0].owner.firstname);
    res.render('all-conversations', { userSession, conversations });
  });
};
const sendMesssageGet = (req, res) => {
  const userSession = req.session.user;
  res.render('send-message', { userSession });
};
const sendMesssagePOST = (req, res) => {
  const message = req.body.message;

  Message.create({
    message,
  }).then(result => {
    res.redirect(`/messages`);
  });
};

module.exports = router
  .post('/update-status', updateReqStatusPOST)
  .get('/', conversationsGet)
  .get('/', sendMesssageGet)
  .get('/', sendMesssagePOST);
