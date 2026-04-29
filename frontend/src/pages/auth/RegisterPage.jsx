import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import axios from "axios"
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [phoneNo,setPhoneNo] = useState("");
    const [gender,setGender] = useState("");
    const [age,setAge] = useState("");
    const [loading,setLoading] = useState(false);
    const [response,setResponse] = useState(null);

    const handleRegister = async(e) =>{
        e.preventDefault();
        setLoading(true)

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/register/patient`,{
                    name,
                    email,
                    password,
                    gender,
                    age,
                    phoneNo
                },{
                    headers:{
                        "Content-Type" : "application/json"
                    }
                }
            )

            const data = res.data;

            if(data.message === "Patient registered Successfully"){
                setResponse(data.message)
                console.log(data.message)
                navigate("/login")
            }else if(data.message ==="User Already exists"){
                setResponse(data.message)
            }
        } catch (error) {
            console.error("Registration Failed",error)
        }finally{
            setLoading(false)
        }
    }
  return (
    <>
      <div className='register'>
        <div className='flex flex-col justify-center items-center h-dvh'>
            <div className='border-2 p-4 rounded-2xl'>
                <form onSubmit={handleRegister}>
                    <h1 className='font-bold text-4xl mb-3'> Register Page</h1>
                    <div className='flex flex-col mb-2'>
                        <label htmlFor='name'>Name</label>
                        <input type='text' placeholder='Enter your name' id='name' name='name' 
                        value={name} onChange={(e)=>setName(e.target.value)} className='border p-2 border-gray-400 rounded'/>
                    </div>
                    <div className='flex flex-col mb-2'>
                        <label htmlFor='email'>Email</label>
                        <input type='email' placeholder='Enter your email' id='email' 
                         value={email} onChange={(e)=>setEmail(e.target.value)}name='email' className='border p-2 border-gray-400 rounded'/>
                    </div>
                    <div className='flex flex-col mb-2'>
                        <label htmlFor='password'>Password</label>
                        <input type='password' placeholder='Enter your password' id='password'
                         value={password} onChange={(e)=>setPassword(e.target.value)} name='password' className='border p-2 border-gray-400 rounded'/>
                    </div>
                    <div className='flex flex-col mb-2'>
                        <label htmlFor='phoneNo'>phoneNo</label>
                        <input type='text' placeholder='Enter your phoneNo' id='phoneNo' 
                         value={phoneNo} onChange={(e)=>setPhoneNo(e.target.value)}name='phoneNo' className='border p-2 border-gray-400 rounded'/>
                    </div>
                    <div className='flex flex-col mb-2'>
                       <div className='flex items-center space-x-4'>
                         <label>Gender</label>
                         <label className='flex items-center space-x-2'>
                            <input
                            type='radio'
                            name='gender'
                            value="Male"
                            checked={gender === "Male"}
                              onChange={(e)=>setGender(e.target.value)}

                            />
                            <span>Male</span>
                         </label>
                         <label className='flex items-center space-x-2'>
                            <input
                            type='radio'
                            name='gender'
                            value="Female"
                            checked={gender === "Female"}
                             onChange={(e)=>setGender(e.target.value)}

                            />
                            <span>Female</span>
                         </label>
                       </div>
                    </div>
                    <div className='flex flex-col mb-2'>
                        <label htmlFor='age'>Age</label>
                        <input type='number' placeholder='Enter your age' id='age' name='age' 
                         value={age} onChange={(e)=>setAge(e.target.value)}className='border p-2 border-gray-400 rounded'/>
                    </div>
                   <button className='mt-3 border-2 w-full rounded-2xl cursor-pointer' type='submit' disabled={loading}>
                    {loading ? "Submitting" : "Submit"}
                   </button>
                </form>

                <div className='mt-2'>
                    <p>
                        Already Registered ? <Link to='/login'>Go to Login</Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </>
  )
}

export default RegisterPage
