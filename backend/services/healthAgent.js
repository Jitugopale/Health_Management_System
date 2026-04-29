import { ollamaChat } from "./ollama.js";
import dotenv from "dotenv"
dotenv.config();

const healthKeywords = [
  "doctor","medicine","health","pain","ache","fever","cough","cold","flu","headache","vomit",
  "blood","pressure","sugar","diabetes","cancer","treatment","therapy","injury","infection",
  "diet","exercise","fitness","yoga","stress","anxiety","depression","sleep","nutrition",
  "dizzy","weak","vomiting","nausea","stomach","heart","eye","skin","mouth","throat","hospital"
];

const nonHealthKeywords = [
  "code","program","bug","server","api","react","node","python","project","database",
  "frontend","backend","ai","ml","model","data","training","docker","github","html","css"
];

function localHealthCheck(msg){
    const text = msg.toLowerCase();
    const isHealth = healthKeywords.some(k => text.includes(k))
    const isNonHealth = nonHealthKeywords.some(k => text.includes(k))
    return isHealth && !isNonHealth;
}
async function isHealthRelated(message) {
    const classifierPrompt=`
    You are a strict classifier.
If the message is about health, medicine, disease, symptoms, fitness, mental health, or wellbeing → reply ONLY "yes".
If it’s anything else → reply ONLY "no".
Never explain. Never write extra text.
    `.trim();

    try {
        const raw = await ollamaChat([
            {role : "system", content : classifierPrompt},
            {role : "user", content : message},
        ],
    {model : process.env.GEN_MODEL,stream:false})

    const res = (typeof raw === "string" ? raw : raw?.message || raw?.output || "")
    .toLowerCase()
    .trim();

    if(res === "yes") return true;
    if(res === "no") return false;

    //fallback
    return localHealthCheck(message)

    } catch (error) {
        console.error("classifier error",error)
    }
    
    
}
export async function handleHealthQuery(message) {
    const text = message.trim().toLowerCase();

    const greetings = ["hi","hello","hey","how are you"]
    if(greetings.some(g=>text.includes(g))){
        return{
            answer:"👋 Hello! I’m HealthBot — your friendly assistant for general health and wellness information. How can I help you today?",
            source:"general"
        }
    }

    const related = await isHealthRelated(text);

    if(!related){
        return{
            answer:
            "I'm HealthBot and can only help with general health-related queries. Try asking me about fitness, diet, symptoms, or wellbeing!",
            source:"non-health"
        }
    }

    const systemPrompt = `
    You are "HealthBot", a friendly assistant that gives short, safe, general health information.
Rules:
- Never diagnose or prescribe.
- If user asks about treatment, suggest consulting a doctor.
- Always end with: (General information only, not medical advice.)
    `.trim();

   try {
     const rawReply = await ollamaChat(
        [
            {role :"system", content:systemPrompt},
            {role :"user", content:message},
        ],
        {model : process.env.GEN_MODEL, stream:false}
    )
    
    const reply = (typeof rawReply === "string" ? rawReply : rawReply?.message || rawReply?.output || "")
    .trim() || "Sorry, I can provide health related information"

    return {
        answer : reply,
        source : "health"
    }
   } catch (error) {
    console.error("Health query error",error);
    return {
        answer: "Sorry, I had trouble processing it. Please try again",
        source : "error"
    }
   }
}