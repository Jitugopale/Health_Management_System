import axios from 'axios';
import React, { useEffect, useState } from 'react'

const BookAppointments = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(()=>{
        const fetchDoctors = async() =>{
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/patient/doctors/getAll`,{
                    headers:{
                        "auth-token":token
                    }
                })
                setDoctors(res.data.data)
            } catch (error) {
                console.error("Error Fetching Doctors",error);
                setMessage("Failed to load Doctors")
            }finally{
                setLoading(false)
            }
        }
        fetchDoctors();
    },[])

    const handleBookAppointment = async(doctorId) =>{
        const confirmBook = window.confirm("Are you want to book this appointment");
        if(!confirmBook) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/patient/request/appointment`,{
                doctorId
            },{
                headers:{
                    "auth-token":token
                }
            })
            setMessage(res.data.message)

            setTimeout(()=>{
                setMessage("")
            },2000)
        } catch (error) {
            console.error("Booking error",error)
            setMessage("Something went wrong while booking appointment")
        }
    }

  return (
    <>
      <div className='p-6'>
        <h2 className='text-2xl! font-semibold mb-4'>Book an Appointment</h2>

        {loading && <p>Loading Doctors...</p>}
        {message && (
            <div className={`mb-4 font-medium ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</div>
        )}

        {!loading && doctors.length ===0 && (
            <p>No doctors available right now</p>
        )}

        <div>
            {doctors.map((doctor,index)=>(
                <div key={index} className='border rounded-xl shadow-md p-4 flex flex-col justify-between bg-white'>
                    <div>
                        <h3 className='text-lg font-bold text-gray-800'>{doctor.name}</h3>
                        <p className='text-sm text-gray-600'>
                            <strong>Specialization:</strong>{doctor.specialization}
                        </p>
                        <p className='text-sm text-gray-600'>
                            <strong>Qualification:</strong>{doctor.qualification}
                        </p>
                        <p className='text-sm text-gray-600'>
                            <strong>Email:</strong>{doctor.email}
                        </p>
                        <p className='text-sm text-gray-600'>
                            <strong>Phone :</strong>{doctor.phoneNo}
                        </p>
                    </div>

                    <button onClick={()=>{handleBookAppointment(doctor.doctorId)}} className='mt-4 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition'>
                        Book Appointment
                    </button>
                </div>
            ))}
        </div>
      </div>
    </>
  )
}

export default BookAppointments
