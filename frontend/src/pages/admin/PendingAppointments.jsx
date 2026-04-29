import axios from 'axios';
import React, { useEffect, useState } from 'react'

function StatusTag({status}){
  const s = status.toLowerCase();
  const base = "text-xs px-2 py-1 rounded-full border"

  const cls =
  s==="booked"
  ? `${base} border-blue-600 text-blue-700`
  : s === "pending"
  ? `${base} border-amber-400 text-amber-700`
  : s === "rejected"
  ? `${base} border-red-600 text-red-700`
  : `${base} bg-gray-100 text-gray-700 border-gray-200`;

  return <span className={cls}>{s}</span>
}

const PendingAppointments = () => {

  const [appointments,setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPendingAppointments = async() =>{
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/appointments/pending/all`,{
        headers:{
          "Content-Type":"application/json",
          "auth-token":localStorage.getItem("token")
        }
      })
      setAppointments(res.data.appointments)
    } catch (error) {
      console.error("Error fetching pending appointments",error)
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    fetchPendingAppointments()
  },[])

 

  if(loading){
    return <p className='text-center mt-5'>Loading Pending appointments...</p>
  }

  if(!appointments.length){
    return <p className='p-4 text-gray-600'>No Pending appointments found</p>
  }
  return (
    <>
      <div className='p-4'>
        <h2 className='text-xl font-semibold mb-4'>Pending Appointments</h2>

        <div className='space-y-4'>
          {appointments.map((appt)=>(
              <div key={appt.appointmentId}
              className='border p-4 rounded-md shadow-sm bg-white'>

                <div className='flex items-center justify-between'>
                  <h3 className='font-semibold text-lg'> Appointment #{appt.appointmentId}</h3>
                  <StatusTag status={appt.status}/>

                </div>

  

                {/* Patient Info */}
                <div className='grid md:grid-cols-2 gap-4 mt-3'>
                <div className='mt-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>Patient Info :</h4>
                  <p><strong>Name :</strong>{appt.patient.name || "N/A"}</p>
                  <p><strong>Email :</strong>{appt.patient.email || "N/A"}</p>
                  <p><strong>Phone :</strong>{appt.patient.phoneNo || "N/A"}</p>
                  <p><strong>Gender :</strong>{appt.patient.gender || "N/A"}</p>
                  <p><strong>Age :</strong>{appt.patient.age || "N/A"}</p>
                </div>

                {/* Doctor Info */}
                <div className='mt-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>Doctor Info :</h4>
                  <p><strong>Name :</strong>{appt.doctor.name || "N/A"}</p>
                  <p><strong>Email :</strong>{appt.doctor.email || "N/A"}</p>
                  <p><strong>Phone :</strong>{appt.doctor.phoneNo || "N/A"}</p>
                  <p><strong>Gender :</strong>{appt.doctor.gender || "N/A"}</p>
                  <p><strong>Age :</strong>{appt.doctor.age || "N/A"}</p>
                  <p><strong>Specialization :</strong>{appt.doctor.specialization || "N/A"}</p>
                  <p><strong>Experience :</strong>{appt.doctor.experience || "N/A"} yrs</p>
                  <p><strong>Qualification :</strong>{appt.doctor.qualification || "N/A"}</p>
                </div>
                </div>

              
                </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default PendingAppointments
