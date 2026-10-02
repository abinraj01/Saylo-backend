const { getConversations, getMessages, getAvailableUsers, createConversation, editMessage } = require('../controllers/chatController');
const { requireAuth } = require('../middlewares/authMiddleware');

const chatRoutes = [
  {
    method: "GET",
    url: "/api/conversations",
    preHandler: requireAuth,
    handler: getConversations,
  },
  {
    method: "GET",
    url: "/api/conversations/:id/messages",
    preHandler: requireAuth,
    handler: getMessages
  },
  {
    method: "GET",
    url: "/api/users/available",
    preHandler: requireAuth,
    handler: getAvailableUsers
  },
  {
    method: "POST",
    url: "/api/conversations",
    preHandler: requireAuth,
    handler: createConversation
  },
  {
    method: "PUT",
    url: "/api/messages/:id",
    preHandler: requireAuth,
    handler: editMessage
  }
];

module.exports = chatRoutes;

