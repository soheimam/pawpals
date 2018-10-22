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
    res.render('all-conversations', { userSession, conversations });
  });
};
const sendMesssageGet = (req, res) => {
  const userSession = req.session.user;
  const id = req.params.id;
  Conversation.findOne({
    where: {
      id,
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
      {
        model: Message,
        where: {
          conversationId: id,
        },
        required: false,
      },
    ],
  }).then(conversation => {
    const otherUser =
      userSession.id === conversation.owner.id ? 'user' : 'owner';

    res.render('send-message', { userSession, conversation, otherUser });
  });
};
const sendMesssagePOST = (req, res) => {
  const message = req.body.message;
  const id = req.params.id;
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;

  Message.create({
    conversationId: id,
    message,
    senderId,
    receiverId,
  }).then(result => {
    res.redirect(`/conversations/${id}`);
  });
};

module.exports = router
  .post('/update-status', updateReqStatusPOST)
  .get('/', conversationsGet)
  .get('/:id', sendMesssageGet)
  .post('/:id', sendMesssagePOST);
