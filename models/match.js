module.exports = (sequelize, type) => {
  return sequelize.define(
    'matches',
    {
      iDofUserThatLiked: {
        type: type.INTEGER,
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
