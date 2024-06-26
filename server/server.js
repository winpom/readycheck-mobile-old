const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { ApolloServer } = require('@apollo/server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Apollo Server setup
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware, // Example of adding authentication middleware to Apollo Server
});

// Apply Apollo middleware to express app
apolloServer.applyMiddleware({ app, path: '/graphql' });

// WebSocket (Socket.IO) setup
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_URL || "http://localhost:3000",
    credentials: true,
  },
});

// WebSocket events
io.on('connection', (socket) => {
  console.log('A user connected');

  // Example socket events
  socket.on('readycheck', (readyCheckID) => {
    io.emit('readycheck', readyCheckID);
    socket.join(readyCheckID);
  });

  socket.on('readycheckUpdate', (readyCheckID) => {
    io.emit('readycheckUpdate', readyCheckID);
    socket.join(readyCheckID);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/readyCheckDB';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`API server running on port ${PORT}!`);
  console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
});
