// Socket.IO event emitter utility

let io = null;

export const setSocketIO = (socketIO) => {
  io = socketIO;
};

export const getSocketIO = () => {
  return io;
};

// Emit event to all connected clients
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Emit event to specific room
export const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

// Emit agent update
export const emitAgentUpdate = (agent, status, message) => {
  if (io) {
    io.emit('agentUpdate', { agent, status, message, timestamp: new Date() });
  }
};

// Emit case update
export const emitCaseUpdate = (caseData) => {
  if (io) {
    io.emit('caseUpdate', caseData);
  }
};

// Emit dashboard update
export const emitDashboardUpdate = (data) => {
  if (io) {
    io.emit('dashboardUpdate', data);
  }
};

// Emit recovery progress
export const emitRecoveryProgress = (caseId, progress, step) => {
  if (io) {
    io.emit('recoveryProgress', { caseId, progress, step, timestamp: new Date() });
  }
};