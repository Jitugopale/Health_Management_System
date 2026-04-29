import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import axios from "axios"
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [userId,setUserId] = useState("");
    const [password,setPassword] = useState("");
    const [loading,setLoading] = useState(false);
    const [response,setResponse] = useState(null);

    const handleLogin = async(e) =>{
        e.preventDefault();
        setLoading(true)

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/login`,{
                    userId,
                    password,
                   
                },{
                    headers:{
                        "Content-Type" : "application/json"
                    }
                }
            )

            const data = res.data;

           if(data.token){
            setResponse(data.message);
            localStorage.setItem("token",data.token)
            localStorage.setItem("role",data.user.role)
            localStorage.setItem("userId",data.user.userId || data.user.adminId)
           }

           if(data.message === "Admin Login Successfully" && data.user.role === "Admin"){
            console.log(data.message)
            navigate('/admin-page')
           }else if(
            data.message === "Login Successful" && data.user.role === "PATIENT"
           ){
            console.log(data.message)
            navigate('/patient-page')
           }
           else if(
            data.message === "Login Successful" && data.user.role === "DOCTOR"
           ){
            console.log(data.message)
            navigate('/doctor-page')
           }
        } catch (error) {
            console.error("Logged In Failed",error)
        }finally{
            setLoading(false)
        }
    }
  return (
    <>
      <div className='login'>
        <div className='flex flex-col justify-center items-center h-dvh'>
            <div className='border-2 p-4 rounded-2xl'>
                <form onSubmit={handleLogin}>
                    <h1 className='font-bold text-4xl mb-3'> Login Page</h1>
                    <div className='flex flex-col mb-2'>
                        <label htmlFor='userId'>User ID</label>
                        <input type='text' placeholder='Enter your userId' id='userId' name='userId' 
                        value={userId} onChange={(e)=>setUserId(e.target.value)} className='border p-2 border-gray-400 rounded'/>
                    </div>
                   
                    <div className='flex flex-col mb-2'>
                        <label htmlFor='password'>Password</label>
                        <input type='password' placeholder='Enter your password' id='password'
                         value={password} onChange={(e)=>setPassword(e.target.value)} name='password' className='border p-2 border-gray-400 rounded'/>
                    </div>
                   
                   <button className='mt-3 border-2 w-full rounded-2xl cursor-pointer' type='submit' disabled={loading}>
                    {loading ? "Submitting" : "Submit"}
                   </button>
                </form>

                <div className='mt-2'>
                    <p>
                        Not Registered ? <Link to='/'>Go to Register</Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
