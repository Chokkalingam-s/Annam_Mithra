require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Database
const db = require("./models");
db.sequelize
  .sync({ alter: true })// ← Change to force: true
  .then(() => {
    console.log("✅ Database synced successfully (FRESH)");
  })
  .catch((err) => {
    console.log("❌ Failed to sync database: " + err.message);
  });

// Socket.io connection
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join_chat", ({ donationId, receiverId }) => {
    const roomId = `chat_${donationId}_${receiverId}`;
    socket.join(roomId);
    console.log(`✅ User joined room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    const roomId = `chat_${data.donationId}_${data.receiverId}`;
    io.to(roomId).emit("receive_message", data);
    console.log(`📨 Message sent to room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Annam Mithra API" });
});

// API Routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/donations", require("./routes/donation.routes"));
app.use("/api/notifications", require("./routes/notification.routes")); // ← ADD THIS LINE
app.use("/api/chat", require("./routes/chat.routes")); // ✅ Add chat routes
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
