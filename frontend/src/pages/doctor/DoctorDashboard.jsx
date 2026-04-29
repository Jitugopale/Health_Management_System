import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Card = ({title, value}) =>{
  return(
    <div className='border rounded p-4 shadow-sm bg-white'>
      <p className='text-sm text-gray-600'>{title}</p>
      <p className='text-2xl font-bold text-blue-600'>{value}</p>
    </div>
  )
}

const DoctorDashboard = () => {

  const [counts, setCounts] = useState({
    pendingAppointments:0,
    bookedAppointments:0,
    rejectedAppointments:0,
    totalAppointments:0,

  })
  const [loading, setLoading] = useState(true);
  const [err,setErr] = useState(null);

  useEffect(()=>{
    (async()=>{
      setErr(null);
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/doctor/dashboard/counts`,{
          headers:{
            "Content-Type":"application/json",
            "auth-token": localStorage.getItem("token")
          }
        })
        setCounts(res.data.data)
      } catch (error) {
        console.error("Error fetching dashboard counts",error)
        setErr("Error fetching dashboard counts")
      }finally{
        setLoading(false)
      }
    })()
  },[])

  if(loading) return <p className='text-gray-800 text-center mt-10'>Loading Dashboard...</p>
  if(err) return <p className='text-red-600 text-center mt-10'>{err}</p>
  return (
    <>
      <div className='p-6'>
        <h2 className='text-2xl! font-bold mb-4 '>Doctor Dashboard</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6'>
          <Card title="Pending Appointments" value={counts.pendingAppointments}/>
          <Card title="Booked Appointments" value={counts.bookedAppointments}/>
          <Card title="Rejected Appointments" value={counts.rejectedAppointments}/>
        
          <Card title="Total Appointments" value={counts.totalAppointments}/>
        
      
        </div>
      </div>
    </>
  )
}

export default DoctorDashboard
