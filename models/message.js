module.exports = (sequelize, type) => {
  return sequelize.define('messages', {
    senderId: {
      type: type.INTEGER,
    },
    receiverId: {
      type: type.INTEGER,
    },
    message: {
      type: type.TEXT,
    },
  });
};
