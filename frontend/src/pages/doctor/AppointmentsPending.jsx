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

const AppointmentsPending = () => {

  const [appointments,setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [form, setForm] = useState({date: "", time:"", notes:""})

  const fetchAppointments = async() =>{
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/doctor/appointments/pending`,{
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
    fetchAppointments()
  },[])

  const handleApprove = async(appointmentId)=>{
    const confirmApprove = window.confirm(
      "Are you want to approve and book this appointment?"
    )

    if(!confirmApprove) return;

    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/doctor/appointments/approve/${appointmentId}`,form,{
        headers:{
          "Content-Type":"application/json",
          "auth-token":localStorage.getItem("token")
        }
      })
      alert("Appointment approved successfully")
      setSelectedAppt(null);
      fetchAppointments();
    } catch (error) {
      console.error("Error approving appointment",error)
    }
  }

  const handleReject = async(appointmentId)=>{
    const confirmApprove = window.confirm(
      "Are you want to reject this appointment?"
    )

    if(!confirmApprove) return;

    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/doctor/appointments/reject/${appointmentId}`,form,{
        headers:{
          "Content-Type":"application/json",
          "auth-token":localStorage.getItem("token")
        }
      })
      alert("Appointment rejected successfully")
      fetchAppointments();
    } catch (error) {
      console.error("Error rejecting appointment",error)
    }
  }

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
                <div className='mt-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>Patient Info :</h4>
                  <p><strong>Name :</strong>{appt.patient.name}</p>
                  <p><strong>Email :</strong>{appt.patient.email}</p>
                  <p><strong>Phone :</strong>{appt.patient.phoneNo}</p>
                  <p><strong>Gender :</strong>{appt.patient.gender}</p>
                  <p><strong>Age :</strong>{appt.patient.age}</p>
                </div>

                {/* Doctor Info */}
                <div className='mt-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>Doctor Info :</h4>
                  <p><strong>Name :</strong>{appt.doctor.name}</p>
                  <p><strong>Email :</strong>{appt.doctor.email}</p>
                  <p><strong>Phone :</strong>{appt.doctor.phoneNo}</p>
                  <p><strong>Specialization :</strong>{appt.doctor.specialization}</p>
                  <p><strong>Experience :</strong>{appt.doctor.experience} yrs</p>
                  <p><strong>Qualification :</strong>{appt.doctor.qualification}</p>
                </div>

                <div className='mt-4 flex gap-3'>
                  <button onClick={()=> setSelectedAppt(
                    selectedAppt === appt.appointmentId ? null : appt.appointmentId
                  )} className='px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 cursor-pointer'>Approve</button>
                  <button onClick={()=> handleReject(appt.appointmentId)} className='px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer'>Reject</button>
                </div>

                {selectedAppt === appt.appointmentId && (
                  <div className='mt-3 pt-3'>
                    <h4 className='font-medium mb-2'>Enter Appointments Details :</h4>
                    <div className='space-y-2'>
                      <input
                      type='date'
                      className='border px-2 py-1 rounded w-full'
                      value={form.date}
                      onChange={(e)=>setForm({...form, date:e.target.value})}/>
                      <input
                      type='text'
                      placeholder='Time (e.g 10:30 AM)'
                      className='border px-2 py-1 rounded w-full'
                      value={form.time}
                      onChange={(e)=>setForm({...form, time:e.target.value})}/>
                      <textarea
                      placeholder='Notes'
                      rows="3"
                      className='border px-2 py-1 rounded w-full'
                      value={form.notes}
                      onChange={(e)=>setForm({...form, notes:e.target.value})}/>

                      <button onClick={()=> handleApprove(appt.appointmentId)} className='mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'>Confirm Approve</button>
                    </div>
                  </div>
                  
                )}
                </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default AppointmentsPending
