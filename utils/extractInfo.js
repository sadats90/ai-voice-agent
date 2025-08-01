
const axios = require("axios");

module.exports = async function extractInfo(text) {
  const prompt = `Extract the full name and city from this sentence: "${text}". Return JSON with 'name' and 'city'.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch (e) {
    return { name: "Unknown", city: "Unknown" };
  }
};
