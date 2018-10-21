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
      status: {
        type: type.STRING,
      },
    },

    {
      timestamps: false,
    }
  );
};
