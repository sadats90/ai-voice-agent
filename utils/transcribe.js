
const axios = require("axios");
const FormData = require("form-data");

module.exports = async function transcribe(audioUrl) {
  try {
    // Add authentication headers for Twilio API
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const audio = await axios.get(audioUrl, { 
      responseType: "arraybuffer",
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    
    const formData = new FormData();
    formData.append('file', audio.data, {
      filename: 'recording.mp3',
      contentType: 'audio/mpeg'
    });
    formData.append('model', 'whisper-1');
    
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    
    console.log("Transcription successful:", response.data);
    return response.data.text;
  } catch (error) {
    console.error("Transcription error:", error.response?.data || error.message);
    throw error;
  }
};
