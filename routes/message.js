const express = require('express');
const router = express.Router();
const { User, Dog, Match } = require('../models');

const updateReqStatusPOST = (req, res) => {
  const userId = req.body.userId;
  const userThatRequested = req.body.userThatRequested;
  const nameThatReq = req.body.nameThatReq;
  const dogId = req.body.dogId;
  const status = req.body.status;
  Match.update(
    {
      status,
    },
    {
      where: {
        iDofUserThatLiked: userThatRequested,
        userId: userId,
        dogId,
      },
    }
  ).then(result => {
    const message =
      status === 'rejected'
        ? `You have rejected a message request from ${nameThatReq}`
        : `Now you can share messages with ${nameThatReq}!!`;
    res.redirect(`/user/${userId}?message=${message}`);
  });
};

module.exports = router.post('/update-status', updateReqStatusPOST);
