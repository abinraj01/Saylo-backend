require('dotenv').config();
const fastify = require("fastify")({ logger: true });
const fastifyCors = require("@fastify/cors");
const multipart = require('@fastify/multipart');
const fastifyCookie = require('@fastify/cookie');
const path = require('path')
const { connectDB } = require("./config/dbconnection");
const authRoutes = require("./routes/auth");
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const Messages = require('./models/messages');

const allowedOrigins = ['http://localhost:3000', "http://192.168.1.16:3000", 'http://localhost:3001', 'http://localhost:5173']; // should change to allow origins

fastify.register(fastifyCors, {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE']
});

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'supersecret',
  parseOptions: {}
});

fastify.register(require('@fastify/formbody'));
fastify.register(multipart, { attachFieldsToBody: true });

// Route for serving 'index.html' for paths starting with '/app/'
fastify.get('/app/*', function (req, reply) {
  reply.sendFile("index.html");
});

// Serve static files from 'uploads'
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads',
  index: false,
  list: true
});

authRoutes.forEach((route) => fastify.route(route));
userRoutes.forEach((route) => fastify.route(route));
chatRoutes.forEach((route) => fastify.route(route));

// Port
const PORT = process.env.PORT || 4000;

// Running server
fastify.listen({ port: PORT, host: "0.0.0.0" }, async (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  
  try {
    // Connect to MongoDB
    await connectDB();
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error);
  }

  console.log(`🚀 Server is running on port ${PORT}`);
});

// Setup Socket.io
fastify.ready(err => {
  if (err) throw err;
  const io = require('socket.io')(fastify.server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Listen for incoming messages directly from the React forms
    socket.on('send_message', async (data) => {
      try {
        // 1. Physically persist the message into MongoDB
        const savedMessage = await Messages.create({
          conversation_id: data.conversation_id,
          sender_id: data.sender_id,
          text: data.text,
          status: 'sent'
        });

        const msgObj = savedMessage.toObject ? savedMessage.toObject() : savedMessage;

        // 2. Broadcast the message output to all listeners immediately
        io.emit('receive_message', {
          id: msgObj.id || msgObj._id.toString(),
          conversation_id: msgObj.conversation_id,
          sender_id: msgObj.sender_id,
          text: msgObj.text,
          timestamp: msgObj.timestamp,
          status: 'sent'
        });
        
      } catch (err) {
        console.error("Error executing Socket MongoDB insertion:", err);
      }
    });

    // Listen for editing messages dynamically
    socket.on('edit_message', async (data) => {
      try {
        const updated = await Messages.findOneAndUpdate(
          { _id: data.message_id, sender_id: data.sender_id },
          { text: data.text, is_edited: true },
          { new: true }
        );

        if (updated) {
          const msgObj = updated.toObject ? updated.toObject() : updated;
          io.emit('message_edited', {
            id: msgObj.id || msgObj._id.toString(),
            conversation_id: msgObj.conversation_id,
            sender_id: msgObj.sender_id,
            text: msgObj.text,
            is_edited: true,
            timestamp: msgObj.timestamp
          });
        }
      } catch (err) {
        console.error("Error executing Socket edit_message:", err);
      }
    });

    // Mirror typing interactions dynamically 
    socket.on('typing_start', (data) => {
      socket.broadcast.emit('typing_start', data);
    });

    socket.on('typing_stop', (data) => {
      socket.broadcast.emit('typing_stop', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
});
