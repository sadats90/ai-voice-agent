const express = require("express");
const router = express.Router();
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const transcribe = require("../utils/transcribe");
const extractInfo = require("../utils/extractInfo");
const fs = require("fs");
const twilio = require("twilio");


const NGROK_URL = process.env.NGROK_URL || "https://6f711107fe43.ngrok-free.app";

router.post("/", async (req, res) => {
  console.log("=== VOICE WEBHOOK CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);


  res.setHeader('ngrok-skip-browser-warning', '1');

  const twiml = new VoiceResponse();
  twiml.say("Hi! What is your full name and city?");
  twiml.record({
    action: `${NGROK_URL}/voice/recorded`,
    transcribe: false
  });

  res.type("text/xml");
  res.send(twiml.toString());
  console.log("TwiML sent successfully");
});


router.get("/", (req, res) => {
  res.setHeader('ngrok-skip-browser-warning', '1');
  res.redirect("/voice");
});

router.post("/recorded", async (req, res) => {
  console.log("Recording received:", req.body);
  res.setHeader('ngrok-skip-browser-warning', '1');

  try {
    const recordingUrl = req.body.RecordingUrl + ".mp3";
    console.log("Recording URL:", recordingUrl);

    const transcript = await transcribe(recordingUrl);
    console.log("Transcript:", transcript);

    const data = await extractInfo(transcript);
    console.log("Extracted data:", data);

    fs.appendFileSync("data/responses.json", JSON.stringify(data) + "\n");
    console.log("Data saved to file");

    const twiml = new VoiceResponse();
    twiml.say("Thanks, your response has been saved.");
    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("Error processing recording:", error);
    const twiml = new VoiceResponse();
    twiml.say("Sorry, there was an error processing your response.");
    res.type("text/xml");
    res.send(twiml.toString());
  }
});

router.post("/call", async (req, res) => {
  res.setHeader('ngrok-skip-browser-warning', '1');
  try {
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers['content-type']);

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Missing Twilio credentials in .env file");
    }
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error("Missing TWILIO_PHONE_NUMBER in .env file");
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const toNumber = req.body.to;

    console.log("Phone number from request:", toNumber);

    if (!toNumber) {
      throw new Error("Phone number is required.");
    }
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    console.log("Making call from:", fromNumber, "to:", toNumber);

    const call = await client.calls.create({
      url: `${NGROK_URL}/voice`,
      to: toNumber,
      from: fromNumber,
    });

    res.json({
      success: true,
      callSid: call.sid,
      message: `Call initiated to ${toNumber}`
    });
  } catch (error) {
    console.error("Error making call:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

