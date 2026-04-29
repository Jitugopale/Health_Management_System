import axios from 'axios';
import React, { useState } from 'react'

const UpdateDoctorPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async(e)=>{
    e.preventDefault();
    if(!newPassword){
      setMessage("Please enter a new password")

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token")

      const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/auth/updatePassword`,{newPassword},{
        headers:{
          "Content-Type":"application/json",
         " auth-token":token
        }
      })

      setMessage(res.data.message || "Password Updated Successfully")
      setTimeout(()=>{
        setMessage("")
      },2000)
      setNewPassword("")
    } catch (error) {
      setMessage("Failed to update password")
    }finally{
      setLoading(false)
    }
    
  }

  return (
    <>
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-xl'>

          <h2 className='text-2xl! font-bold mb-4 text-center text-blue-600'>Update Password</h2>

          <form onSubmit={handleUpdate}>
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>New Password</label>

              <input
              type='password'
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              placeholder='Enter new Password'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200'/>
            </div>

            <button type='submit'
            disabled={loading}
            className='w-full bg-blue-600 py-2 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer'>{loading ? "Updating..." : "Update Password"}</button>
          </form>

          {
            message && (
              <p className='text-center mt-4 text-gray-700 font-medium'>{message}</p>
            )
          }
        </div>

      </div>
    </>
  )
}

export default UpdateDoctorPassword
