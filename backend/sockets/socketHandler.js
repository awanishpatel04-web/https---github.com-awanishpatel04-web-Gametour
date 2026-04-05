const Match = require('../models/Match');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join match room for live updates
    socket.on('join-match', (matchId) => {
      socket.join(`match-${matchId}`);
      console.log(`Socket ${socket.id} joined match ${matchId}`);
    });
    
    // Leave match room
    socket.on('leave-match', (matchId) => {
      socket.leave(`match-${matchId}`);
      console.log(`Socket ${socket.id} left match ${matchId}`);
    });
    
    // Send chat message
    socket.on('send-message', (data) => {
      io.to(`match-${data.matchId}`).emit('new-message', {
        user: data.user,
        message: data.message,
        timestamp: new Date()
      });
    });
    
    // Live score update (from organizer)
    socket.on('update-score', async (data) => {
      try {
        const match = await Match.findById(data.matchId);
        if (match) {
          match.scoreA = data.scoreA;
          match.scoreB = data.scoreB;
          match.liveUpdates.push({
            message: data.message,
            scoreA: data.scoreA,
            scoreB: data.scoreB,
            timestamp: new Date()
          });
          await match.save();
          
          io.to(`match-${data.matchId}`).emit('score-updated', {
            scoreA: data.scoreA,
            scoreB: data.scoreB,
            message: data.message,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating score:', error);
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = { setupSocket };