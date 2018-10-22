const Sequelize = require('sequelize');
const userModel = require('./user.js');
const dogModel = require('./dog.js');
const matchModel = require('./match.js');
const msgModel = require('./message.js');
const conversationModel = require('./conversation.js');
//environment vars
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

//db config
const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? true : false,
  },
});

// Declare Models
const User = userModel(db, Sequelize);
const Dog = dogModel(db, Sequelize);
const Match = matchModel(db, Sequelize);
const Message = msgModel(db, Sequelize);
const Conversation = conversationModel(db, Sequelize);

// Establish relations
User.hasMany(Dog);
Dog.belongsTo(User);
Dog.hasMany(Match);
User.hasMany(Match);
Match.belongsTo(User);
Match.belongsTo(Dog);
User.hasMany(Conversation);
Conversation.belongsTo(User, {
  as: 'owner',
  foreignKey: 'ownerId',
});
Conversation.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

Conversation.belongsTo(Dog);

Message.belongsTo(User, {
  foreignKey: 'senderId',
});

Message.belongsTo(User, {
  foreignKey: 'receiverId',
});

Conversation.hasMany(Message);
Message.belongsTo(Conversation);

module.exports = {
  db,
  User,
  Dog,
  Match,
  Message,
  Conversation,
};
