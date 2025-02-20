// socket.js
const { Server } = require('socket.io');

// import config from './../config.js';
// const { mySqlDriver } = config;
let io;
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on(
      'createNewOrder',
      async ({
        senderId,
        receiverId,
        message,
        relatedEntityName,
        relatedEntityId,
        forAdmin,
        dateCreated
      }) => {
        console.log({ relatedEntityName, relatedEntityId, forAdmin });
      }
    );

    // socket.on(
    //   'sendMessage',
    //   async ({ senderId, receiverId, message, is_from_student = false }) => {
    //     const query = `INSERT INTO messages (sender_id, receiver_id, message, is_from_student) VALUES (?, ?, ?, ?)`;
    //     await mySqlDriver.query(query, [
    //       senderId,
    //       receiverId,
    //       message,
    //       is_from_student
    //     ]);
    //     io.emit('receiveMessage', { senderId, receiverId });
    //   }
    // );

    // socket.on('readMessage', async data => {
    //   try {
    //     const emitData = new Set();

    //     let filteredMessages = data.filter(item => item.is_read < 1);

    //     await Promise.all(
    //       filteredMessages.map(async item => {
    //         const {
    //           sender_id: senderId,
    //           receiver_id: receiverId,
    //           message
    //         } = item;
    //         const query = `UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?`;
    //         await mySqlDriver.query(query, [senderId, receiverId]);

    //         const uniqueKey = `${senderId}-${receiverId}`;
    //         emitData.add(uniqueKey);

    //         io.emit('receiveMessage', { senderId, receiverId, message });
    //       })
    //     );
    //   } catch (error) {
    //     console.error('Error marking messages as read:', error);
    //     socket.emit('error', { message: 'Failed to mark messages as read.' });
    //   }
    // });

    // socket.on('reloadRequestList', async data => {
    //   try {
    //     console.log('heyhey');
    //   } catch (error) {}
    // });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
function getSocketInstance() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initializeSocket, getSocketInstance };
