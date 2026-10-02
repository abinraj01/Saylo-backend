const Conversations = require('../models/conversations');
const Messages = require('../models/messages');
const { Users } = require('../models/users');

// GET all conversations for the deeply authenticated user
const getConversations = async (req, res) => {
  try {
    const userId = String(req.user.userId);

    // Fetch conversation documents where user is user1_id or user2_id
    const convDocs = await Conversations.find({
      $or: [{ user1_id: userId }, { user2_id: userId }]
    });

    const conversations = await Promise.all(
      convDocs.map(async (conv) => {
        const convId = conv._id.toString();
        const participantId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

        const participant = await Users.findById(participantId).select("name profile_pic status");
        const lastMsg = await Messages.findOne({ conversation_id: convId }).sort({ timestamp: -1 });

        return {
          conversation_id: convId,
          participant_id: participant ? participant._id.toString() : participantId,
          participant_name: participant ? participant.name : 'User',
          participant_avatar: participant ? participant.profile_pic : null,
          participant_status: participant ? participant.status : 0,
          last_message: lastMsg ? lastMsg.text : null,
          last_message_time: lastMsg ? lastMsg.timestamp : conv.created_at,
          message_status: lastMsg ? lastMsg.status : null
        };
      })
    );

    // Sort by latest message timestamp descending
    conversations.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
    
    res.send({ status: 1, data: conversations });
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).send({ error: 'Server error fetching conversations' });
  }
};

// GET all messages inside a specific conversation
const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    const messageDocs = await Messages.find({ conversation_id: conversationId }).sort({ timestamp: 1 });
    const messages = messageDocs.map(m => m.toObject());

    res.send({ status: 1, data: messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send({ error: 'Server error fetching messages' });
  }
};

// GET available users to optionally start a chat with
const getAvailableUsers = async (req, res) => {
  try {
    const userId = String(req.user.userId);
    const userDocs = await Users.find({ _id: { $ne: userId }, status: { $ne: 0 } }).select("name email profile_pic");
    
    const users = userDocs.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      profile_pic: u.profile_pic
    }));

    res.send({ status: 1, data: users });
  } catch (err) {
    console.error("Error fetching available users:", err);
    res.status(500).send({ error: 'Server error fetching available users' });
  }
};

// POST create a conversation (or return existing one to strictly prevent duplicate threads)
const createConversation = async (req, res) => {
  try {
    const userId = String(req.user.userId);
    const targetUserId = String(req.body.targetUserId);
    
    const existing = await Conversations.findOne({
      $or: [
        { user1_id: userId, user2_id: targetUserId },
        { user1_id: targetUserId, user2_id: userId }
      ]
    });

    if (existing) {
      return res.send({ status: 1, data: existing.toObject() });
    }

    const newConv = await Conversations.create({
      user1_id: userId,
      user2_id: targetUserId
    });
    
    res.send({ status: 1, data: newConv.toObject() });
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).send({ error: 'Server error creating conversation' });
  }
};

// PUT edit a message text
const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { text } = req.body;
    const userId = String(req.user.userId);

    const updated = await Messages.findOneAndUpdate(
      { _id: messageId, sender_id: userId },
      { text: text, is_edited: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send({ error: "Message not found or unauthorized" });
    }

    res.send({ status: 1, data: updated.toObject() });
  } catch (err) {
    console.error("Error editing message:", err);
    res.status(500).send({ error: "Server error editing message" });
  }
};

module.exports = {
  getConversations,
  getMessages,
  getAvailableUsers,
  createConversation,
  editMessage
};


