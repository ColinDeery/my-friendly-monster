const { Monster, User } = require("../models");
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {
    // Find a user based upon user Id
    user: async (parent, { userId }) => {
      return await User.findOne({_id: userId});
    },
    monsters: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Monster.find(params).sort({ createdAt: -1 })
    }
  },

  Mutation: {
    // Add a user and assign them a JWT
    addUser: async (parent, { username, password }) => {
      const user = await user.create({ username, password });
      const token = signToken(user);
      return { token, user };
    },
    //   Login a user
    login: async (parent, { username, password }) => {
      const user = await user.findOne({ username });
      // checking if the username is valid & throwing an error if not
      if (!user) {
        throw new AuthenticationError(
          "Sorry friend! Unable to log you in. Check your username & password. Thanks!"
        );
      }
      // Checking for proper password
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError(
          "Sorry friend! Unable to log you in. Check your username & password. Thanks!"
        );
      }
      // If they successfully login, they're issued a JWT
      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, { username, password }) => {
      const user = await User.create({ username, password });
      const token = signToken(user);
      return { token, user };
    },

    addMonster: async (parent, { fullName, userId, imageUrl }, context ) => {
      // if (context.user) {
        const monster = await Monster.create({
          fullName,
          imageUrl
        });

        await User.findOneAndUpdate(
          // { _id: context.user._id },
          { _id: userId },
          { $addToSet: { monsters: monster._id } }
        );

        return monster;
      // }
      // throw new AuthenticationError('You need to be logged in!');
      return await Monster.create({ fullName, userId });
    },

    updateMonster: async (parent, { id, userId }) => {
      return await Monster.findOneAndUpdate(
        { _id: id },
        { userId },
        { new: true }
      );
    },
    //  Might need a second opinion on this one in particular)
    removeMonster: async (parent, { monsterId }, context) => {
      if (context.user) {
        const monster = await Monster.findOneAndDelete({
          _id: monsterId,
        });
        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { monster: monster._id } }
        );
        return monster;
      }
    }
  }
};

module.exports = resolvers;
