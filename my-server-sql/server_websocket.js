const io = require("socket.io")(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("subscribeToJob", (jobId) => {
    socket.join(`job-${jobId}`);
  });
});
