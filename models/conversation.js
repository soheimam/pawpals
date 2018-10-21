module.exports = (sequelize, type) => {
  return sequelize.define('conversations', {
    ownerId: {
      type: type.INTEGER,
    },
    userId: {
      type: type.INTEGER,
    },
  });
};
