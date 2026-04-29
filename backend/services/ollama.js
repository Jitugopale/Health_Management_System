import dotenv from "dotenv"
import axios from "axios"
dotenv.config();

export const OLLAMA_URL = process.env.OLLAMA_URL;
export const GEN_MODEL = process.env.GEN_MODEL;

export async function ollamaChat(messages,{model = GEN_MODEL, stream = false} = {}) {
    try {
        const {data} = await axios.post(`${OLLAMA_URL}/api/chat`,{
            model,
            messages,
            stream
        })

        return data?.message?.content ?? ""
    } catch (error) {
        console.error("ollamaChatErrror",error.message)
    }
    
}