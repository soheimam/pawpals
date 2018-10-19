const express = require('express');
const router = express.Router();
const { User, Dog, Match } = require('../models');

const acceptMsgReqPOST = (req, res) => {
  const userthatacceptReqId = req.body.userThatAccepts;
  const userThatRequested = req.body.userThatRequested;
  Match.update(
    {
      accepted: true,
    },
    {
      where: {
        iDofUserThatLiked: userThatRequested,
        userId: userthatacceptReqId,
      },
    }
  ).then(result => {
    console.log(result);
  });
};

module.exports = router.post('/accept', acceptMsgReqPOST);
