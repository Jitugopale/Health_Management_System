import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function ollamaChat(messages, { model = process.env.GROQ_MODEL } = {}) {
  try {
    const { data } = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      { model, messages },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data?.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    console.error("Groq chat error", error.message);
    return "";
  }
}
