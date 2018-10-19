module.exports = (sequelize, type) => {
  return sequelize.define(
    'matches',
    {
      iDofUserThatLiked: {
        type: type.STRING,
      },
      nameOfUserThatLiked: {
        type: type.STRING,
      },
      accepted: {
        type: type.BOOLEAN,
      },
    },

    {
      timestamps: false,
    }
  );
};
