import axios from 'axios';
import React, { useState } from 'react'

const CreateDoctors = () => {
    const [formData, setFormData] = useState({
        name:"",
        email:"",
        specialization:"",
        experience:"",
        qualification:"",
        phoneNo:"",
    })

    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>{
        setFormData({
            ...formData,
            [e.target.name] : e.target.value
        })
    }

    const handleSubmit = async(e) =>{
        e.preventDefault();
        setError("");
        setSuccess(null)
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/admin/doctor/create`,formData,{
                headers:{
                    "Content-Type":"application/json",
                    "auth-token":localStorage.getItem("token")
                }
            })

            setSuccess(res.data);
            setFormData({
                name:"",
        email:"",
        specialization:"",
        experience:"",
        qualification:"",
        phoneNo:"",
            })
        } catch (error) {
            setError("Failed to create doctor")
        }finally{
            setLoading(false)
        }
    }
  return (
    <>
      <div className='p-6 max-w-5xl bg-white shadow-md rounded-2xl'>
        <h2 className='text-2xl! font-semibold mb-6 text-gray-800'>Create Doctor</h2>

        <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                <input
                type='text'
                name='name'
                placeholder='Enter doctors full name'
                value={formData.name}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                <input
                type='email'
                name='email'
                placeholder='Enter email address'
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Specialization</label>
                <input
                type='text'
                name='specialization'
                placeholder='eg., Heart Transplant'
                value={formData.specialization}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Qualification</label>
                <input
                type='text'
                name='qualification'
                placeholder='eg., MBBS, MD'
                value={formData.qualification}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Experience (Years)</label>
                <input
                type='number'
                name='experience'
                placeholder='eg., 5'
                value={formData.experience}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>PhoneNo</label>
                <input
                type='text'
                name='phoneNo'
                placeholder='eg., 9878765654'
                value={formData.phoneNo}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200'/>
            </div>

            <div className='md:col-span-2'>
                <button type='submit' disabled={loading} className='w-full bg-blue-600 cursor-pointer text-white p-2 rounded-md font-semibold transition-all disabled:opacity-50'>
                    {loading ? "Creating" : "Create Doctor"}
                </button>
            </div>

            {error && (
                <p className='mt-4 text-red-600 font-medium text-center'>{error}</p>
            )}

            {success && (
                <div className='mt-6 bg-gray-100 border border-gray-300 rounded-md p-4'>
                    <h3 className='text-green-700 font-semibold mb-2'>Doctor Created Successfully</h3>

                    <p>
                        <strong>Doctor Name :</strong>{success.users.name || "N/A"}
                    </p>
                    <p>
                        <strong>Email :</strong>{success.users.email || "N/A"}
                    </p>
                    <p>
                        <strong>PhoneNo :</strong>{success.users.phoneNo || "N/A"}
                    </p>
                    <p>
                        <strong>Gender :</strong>{success.users.gender || "N/A"}
                    </p>
                    <p>
                        <strong>Age :</strong>{success.users.age || "N/A"}
                    </p>
                    <p>
                        <strong>Specialization :</strong>{success.doctor.specialization || "N/A"}
                    </p>
                    <p>
                        <strong>Experience :</strong>{success.doctor.experience || "N/A"}
                    </p>
                    <p>
                        <strong>Qualification :</strong>{success.doctor.qualification || "N/A"}
                    </p>
                    <p>
                        <span className='font-semibold text-gray-800 '>Created At:</span>{" "}
                        {success.users.createdAt
                        ?new Date(success.users.createdAt || "N/A").toLocaleDateString() : "N/A"}
                    </p>

                    <p className='text-gray-600 mt-2 text-sm'>
                        (Credentials also sent via email)
                    </p>
                  
                </div>
            )}
        </form>
      </div>
    </>
  )
}

export default CreateDoctors
