import axios from 'axios'
import React, { useEffect, useState } from 'react'

const ChatWindow = ({appointmentId, receiverId}) => {
    const [messages, setMessages] = useState([])
    const [newMsg, setNewMsg] = useState("")
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    const uniqueuserId = localStorage.getItem("userId")

    const fetchMessages = async () =>{
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/auth/getMessages/${appointmentId}`,{
                headers:{
                    "Content-Type":"application/json",
                    "auth-token" : localStorage.getItem("token")
                }
            })
            setMessages(res.data.chat)
            console.log(res.data)
        } catch (error) {
            console.error("Error Fetching Messages",error)
        }finally{
            setLoading(false)
        }
    }

    const handleSend = async() =>{
        if(!newMsg.trim()) return;

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/sendMessage`,{
                appointmentId,
                receiverId,
                message : newMsg.trim()
            },{
                headers:{
                    "Content-Type":"application/json",
                    "auth-token":localStorage.getItem("token")
                }
            })
            setNewMsg("");
            fetchMessages();
            
        } catch (error) {
            console.error("Error Sending Message",error)
        }
    }

    useEffect(()=>{
        if(isOpen) fetchMessages();
    },[isOpen])

    const formatTime = (timestamp)=>{
        const date = new Date(timestamp);
        const isTime = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
        return isTime.toLocaleTimeString([],{
            hour: "2-digit",
            minute:"2-digit",
            hour12:true,
        })
    }
  return (
    <>
      <div className='mt-4 border-t pt-3'>
        { !isOpen ? (
            <div className='text-center'>
                <p className='text-gray-600 mb-2 text-sm'>Click below to start chatting</p>
                <button onClick={()=> setIsOpen(true)} className='bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer'>Open Chat</button>
                </div>
        ):(
            <>
            <div className='flex justify-between items-center mb-2'>
                <h4 className='font-semibold text-gray-800'>Chat Messages</h4>
                <button onClick={()=> setIsOpen(false)} className='text-red-600 text-xs underline cursor-pointer'>Close</button>
            </div>

            {loading ? (
                <p className='text-sm text-gray-500 '>Loading Chats...</p>
            ):(
                <div className='h-48 overflow-y-auto border p-2 rounded-md bg-gray-50'>
                    {messages.length ? (
                        messages.map((msg)=>{
                            const isSender = msg.senderId === uniqueuserId;
                            return(
                                <div key={msg.id || Math.random()}
                                className={`my-2 flex ${
                                    isSender ? "justify-end" : "justify-start"
                                }`}>
                                    <div className={`max-w-[70%] p-2 rounded-lg text-sm shadow-sm ${
                                        isSender 
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                                    }`}>
                                        <p>{msg.message}</p>
                                        <p className='text-[10px] text-right opacity-70 mt-1'>{formatTime(msg.createdAt)}</p>

                                    </div>

                                </div>
                            )
                        })
                    ):(
                        <p className='text-gray-500 text-sm text-center'>No message yet</p>
                    )}
                </div>
            )}

            <div className='flex gap-2 mt-3'>
                <input
                type='text'
                value={newMsg}
                onChange={(e)=> setNewMsg(e.target.value)}
                placeholder='Type your message...'
                className='flex-1 border p-2 rounded-md text-sm'/>

                <button onClick={handleSend} className='bg-blue-600 text-white px-4 rounded-md text-sm cursor-pointer hover:bg-blue-700'>Send</button>
            </div>
            </>
        )}
      </div>
    </>
  )
}

export default ChatWindow
