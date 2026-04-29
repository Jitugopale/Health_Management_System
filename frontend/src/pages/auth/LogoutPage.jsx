import React from 'react'
import { useNavigate } from 'react-router-dom'

const LogoutPage = () => {
    const navigate = useNavigate();

    const logout = () =>{
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        navigate("/login")
    }
  return (
    <>
      <button onClick={logout} className='text-xs px-2 py-1 border rounded hover:bg-red-600 hover:text-white cursor-pointer'>
        Logout
      </button>
    </>
  )
}

export default LogoutPage
