const { User, ReadyCheck, Notification } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        getUser: async (_, { id }) => {
            return User.findById(id).populate('friends ownedReadyChecks receivedReadyChecks');
        },

        getUserByUsername: async (_, { username }) => {
            return User.findOne({ username }).populate('friends ownedReadyChecks receivedReadyChecks');
        },

        getUsers: async (_, __, context) => {
            return User.find({});
        },

        getReadyCheck: async (_, { id }) => {
            return ReadyCheck.findById(id)
                .populate('owner')
                .populate('invitees')
                .populate({
                    path: 'RSVPs.user',
                    model: 'User',
                })
                .populate({
                    path: 'chatMessages.user',
                    model: 'User',
                });
        },

        readyChecks: async () => {
            return ReadyCheck.find().populate('owner invitees RSVPs.user');
        },

        getFriends: async (_, { userId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const user = await User.findById(userId).populate('friends');
            return user.friends;
        },

        me: async (_, __, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            return User.findById(context.user._id).populate('friends').populate('ownedReadyChecks').populate('receivedReadyChecks');
        },

        notifications: async (_, { userId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            return Notification.find({ recipient: userId }).populate('sender readyCheck');
        },

        readyChecks: async () => {
            return ReadyCheck.find().populate('owner attendees.user');
        },

        readyCheck: async (_, { _id }) => {
            return ReadyCheck.findById(_id).populate('owner').populate("RSVPs[0]");
        },
    },

    Mutation: {
        createUser: async (_, { username, email, password }) => {
            const newUser = await User.create({ username, email, password });
            const token = signToken(newUser);
            return { token, newUser };
        },

        deleteUser: async (_, { _id }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const userId = context.user._id;

            await ReadyCheck.deleteMany({ owner: userId });

            await Notification.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });

            const deletedUser = await User.findOneAndDelete({ _id: userId });

            return deletedUser;
        },

        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('User not found');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password');
            }

            const token = signToken(user);

            return { token, user };
        },

        followFriend: async (_, { username }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
        
            // Use a case-insensitive regex to find the friend
            const friend = await User.findOne({ username: { $regex: new RegExp(username, "i") } });
            if (!friend) {
                throw new AuthenticationError('Friend not found');
            }
        
            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $addToSet: { friends: friend._id } },
                { new: true }
            ).populate('friends');
        
            await Notification.create({
                type: 'follow',
                sender: context.user._id,
                recipient: friend._id,
                createdAt: new Date()
            });
        
            return updatedUser;
        },        

        unfollowFriend: async (_, { username }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const friend = await User.findOne({ username });
            if (!friend) {
                throw new AuthenticationError('Friend not found');
            }

            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $pull: { friends: friend._id } },
                { new: true }
            ).populate('friends');

            await Notification.create({
                type: 'unfollow',
                sender: context.user._id,
                recipient: friend._id,
                createdAt: new Date()
            });

            return updatedUser;
        },

        createReadyCheck: async (_, { input }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
        
            const { title, activity, timing, description, inviteeIds } = input;
        
            const newReadyCheck = new ReadyCheck({
                title,
                activity,
                timing,
                description,
                invitees: inviteeIds,
                owner: context.user._id
            });
        
            await newReadyCheck.save();
        
            // Create an array of promises for creating notifications and updating receivedReadyChecks
            const updatePromises = inviteeIds.map(async (inviteeId) => {
                await Notification.create({
                    type: 'readyCheck',
                    sender: context.user._id,
                    recipient: inviteeId,
                    readyCheck: newReadyCheck._id,
                    createdAt: new Date(),
                });

                await User.findByIdAndUpdate(inviteeId, {
                    $addToSet: { receivedReadyChecks: newReadyCheck._id }
                });
            });
        
            // Wait for all promises to complete
            await Promise.all(updatePromises);
        
            return newReadyCheck;
        },

        updateReadyCheck: async (_, { id, title, activity, timing, description }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
        
            const updatedData = await ReadyCheck.findByIdAndUpdate(
                id,
                { title, activity, timing, description },
                { new: true }
            ).populate('owner invitees RSVPs.user');
            return updatedData;
        },
        
        deleteReadyCheck: async (_, { id }, context) => {
            if (!context.user) {
              throw new AuthenticationError('You need to be logged in to perform this action');
            }
      
            try {
              const readyCheck = await ReadyCheck.findById(id);
      
              if (!readyCheck) {
                throw new Error('ReadyCheck not found');
              }
      
              // Ensure the current user is the owner of the ready check
              if (readyCheck.owner.toString() !== context.user._id.toString()) {
                throw new AuthenticationError('You are not authorized to delete this ReadyCheck');
              }
      
              await ReadyCheck.findByIdAndDelete(id);
              return true;
            } catch (error) {
              console.error(error);
              return false;
            }
          },

        updateUserStatus: async (_, { status }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $set: { status } },
                { new: true }
            ).populate('friends');

            return updatedUser;
        },

        updateUserBio: async (_, { bio }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { bio },
                { new: true }
            );

            return updatedUser;
        },

        deleteNotification: async (_, { notificationId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const notification = await Notification.findByIdAndDelete(notificationId);
            return notification;
        },

        rsvpReadyCheck: async (_, { readyCheckId, userId, reply }) => {
            const readyCheck = await ReadyCheck.findById(readyCheckId);
            if (!readyCheck) {
                throw new Error('ReadyCheck not found');
            }

            // Find the existing RSVP for the user
            const existingRSVP = readyCheck.RSVPs.find((rsvp) => rsvp.user.toString() === userId);

            if (existingRSVP) {
                // Update the reply for the existing RSVP
                existingRSVP.reply = reply;
            } else {
                // Create a new RSVP and add it to the RSVPs array
                readyCheck.RSVPs.push({ user: userId, reply });
            }

            await readyCheck.save();

            // Optionally, populate any fields you need before returning the updated ready check
            return readyCheck.populate('owner RSVPs.user');
        },

        sendMessage: async (_, { readyCheckId, userId, content }) => {
            const readyCheck = await ReadyCheck.findById(readyCheckId);
            if (!readyCheck) {
                throw new Error('ReadyCheck not found');
            }

            // Create a new chat message
            const newMessage = {
                user: userId,
                content,
                timestamp: new Date().toISOString(), // Use current timestamp
            };

            // Add the new message to the chatMessages array
            readyCheck.chatMessages.push(newMessage);

            // Save the updated ready check
            await readyCheck.save();

            // Return the updated ready check with populated chat messages
            return readyCheck.populate('chatMessages.user');
        },
    }
};

module.exports = resolvers;
