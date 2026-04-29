import axios from 'axios';
import React, { useState } from 'react'
import {MessageCircle, X} from "lucide-react"

const ChatAgentWidget = () => {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const send = async() =>{
        if(!text.trim()) return;
        const user = {sender : "user", text: text.trim()};
        setMsgs((m)=> [...m, user])
        setText("");
        setLoading(true)

        try {
            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/patient/agent/chat`,{
                message: user.text
            },{
                headers:{
                    "Content-Type": "application/json",
                    "auth-token":localStorage.getItem("token")
                }
            })

            setMsgs((m)=> [...m, {sender: "bot", text: data.reply || "Sorry, I didn't understant"}])
        } catch (error) {
            setMsgs((m)=> [...m, {sender: "bot", text: "Server error, try again later"}])
        }finally{
            setLoading(false)
        }
    }
  return (
    <>
      <button onClick={()=>setOpen(!open)} className='fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded shadow-lg cursor-pointer'>
        {open ? <X size={22}/> : <MessageCircle size={24}/>}
      </button>

      {open && (
        <div className='fixed bottom-20 right-5 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border flex flex-col overflow-hidden'>
            <div className='bg-blue-600 text-white px-4 py-2 flex justify-between items-center'>
                <h3 className='font-semibold text-sm'>AI Health Assistant</h3>
                <X size={16} className='cursor-pointer ' onClick={()=> setOpen(false)}/>
            </div>

            <div className='flex-1 overflow-y-auto bg-gray-50 p-3 text-sm max-h-80'>
                {msgs.length === 0 ? (
                    <p className='text-gray-500 text-center mt-10'>Hi! How can I help you?</p>
                ):(
                    msgs.map((m,i) => (
                        <div key={i} className={`my-2 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`p-2 rounded-lg max-w-[75%] ${
                                m.sender === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-900 rounded-bl-none"
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    ))
                )}{
                    loading && (
                        <p className='text-gray-500 italic text-center mt-2 text-xs'>Thinking...</p>
                    )
                }

            </div>
            <div className='border-t flex items-center gap-2 p-2 bg-white'>
                <input
                value={text}
                onChange={(e)=> setText(e.target.value)}
                onKeyDown={(e)=> e.key === "Enter" && send()}
                placeholder='Type your message...'
                className='flex-1 border px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400'/>

                <button onClick={send}
                disabled={loading}
                className='bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer'>
                    Send
                </button>
            </div>

        </div>
      )}
    </>
  )
}

export default ChatAgentWidget
