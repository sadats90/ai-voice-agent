require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const voiceRoutes = require("./routes/voice");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware to set ngrok bypass header on all responses
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', '1');
  next();
});


app.get("/", (req, res) => {
  res.send("Voice MVP Server is running! Go to /voice for voice routes.");
});


app.get("/call-form", (req, res) => {
  res.sendFile(__dirname + "/call.html");
});


app.get("/test", (req, res) => {
  res.json({ message: "Server is working!", timestamp: new Date().toISOString() });
});


app.use("/voice", voiceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
