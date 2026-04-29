import axios from 'axios';
import React, { useEffect, useState } from 'react'

const UpdatedoctorInfo = () => {
  const [form,setForm] = useState({
    name:"",
    email:"",
    phoneNo:"",
    specialization:"",
    experience:"",
    qualification:"",
  })

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(()=>{
    const fetchDoctorInfo = async()=>{
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/doctor/get/info`,{
          headers:{
            "auth-token":localStorage.getItem("token")
          }
        })
        setForm(res.data.doctor)
      } catch (error) {
        setMessage("failed to load doctor info")
      }finally{
        setLoading(false)
      }
    }
    fetchDoctorInfo();
  },[])

  const handleChange = (e) =>{
    setForm({...form,[e.target.name]: e.target.value})
  }

  const handleUpdate = async(e)=>{
    e.preventDefault();

    const confirmUpdate = window.confirm("Are you sure you want to update your profile?")

    if(!confirmUpdate) return;

    try {
      const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/doctor/update/info`,form,{
        headers:{
          "Content-Type":"application/json",
          "auth-token":localStorage.getItem("token")
        }
      })
      setMessage(res.data.message)
      setTimeout(()=>{
        setMessage("")
      },2000)
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile",error)
      setMessage("Failed to update profile")
    }
  }

  if(loading) return <p className='text-center mt-5'>Loading Profile...</p>


  return (
    <>
      <div className='max-w-xl mx-auto p-6 mt-10 border rounded-md shadow bg-white'>
        <h2 className='text-xl! font-semibold mb-4 text-center'>Update Doctor Info</h2>

{message && <p className='text-center text-blue-600 mb-3'>{message}</p>}

<form onSubmit={handleUpdate} className='space-y-4'>
  <div>
    <label className='block font-medium'>Name :</label>
    <input
    type='text'
    name='name'
    value={form.name}
    onChange={handleChange}
    className='w-full border rounded p-2'/>
  </div>
  <div>
    <label className='block font-medium'>Email :</label>
    <input
    type='email'
    name='email'
    value={form.email}
    onChange={handleChange}
    className='w-full border rounded p-2'/>
  </div>
  <div>
    <label className='block font-medium'>Phone No :</label>
    <input
    type='text'
    name='phoneNo'
    value={form.phoneNo}
    onChange={handleChange}
    className='w-full border rounded p-2'/>
  </div>
  <div>
    <label className='block font-medium'>Specialization :</label>
    <input
    type='text'
    name='specialization'
    value={form.specialization}
    onChange={handleChange}
    className='w-full border rounded p-2'/>
  </div>
  <div>
    <label className='block font-medium'>Experience (Years) :</label>
    <input
    type='number'
    name='experience'
    value={form.experience}
    onChange={handleChange}
    className='w-full border rounded p-2'/>
  </div>
  <div>
    <label className='block font-medium'>Qualification :</label>
    <input
    type='text'
    name='qualification'
    value={form.qualification}
    onChange={handleChange}
    className='w-full border rounded p-2'/>
  </div>

  <button type='submit' className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer'>
    Update Profile
  </button>
</form>

      </div>
    </>
  )
}

export default UpdatedoctorInfo
