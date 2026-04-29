import axios from 'axios';
import React, { useEffect, useState } from 'react'


const AllPatients = () => {

  const [patients,setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAllPatients = async() =>{
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/patients/all`,{
        headers:{
          "Content-Type":"application/json",
          "auth-token":localStorage.getItem("token")
        }
      })
      setPatients(res.data.patients)
    } catch (error) {
      console.error("Error fetching all patients",error)
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    fetchAllPatients()
  },[])

 

  if(loading){
    return <p className='text-center mt-5'>Loading Patients...</p>
  }

  if(!patients.length){
    return <p className='p-4 text-gray-600'>No Patients found</p>
  }
  return (
    <>
      <div className='p-4'>
        <h2 className='text-xl font-semibold mb-4'>All Registered Patients</h2>

        <div className='space-y-4'>
          {patients.map((p)=>(
              <div key={p.userId}
              className='border p-4 rounded-md shadow-sm bg-white'>

                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-xl!'>{p.name}</h3>
                  <span className='text-sm text-gray-600'>
                    ID : {p.userId}
                  </span>

                </div>

  

                {/* Patient Info */}
                <div className='grid md:grid-cols-2 gap-4 mt-3 text-sm'>
                  <p><span className='font-semibold text-gray-800'>Name :</span>{" "}
                  {p.name || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Email :</span>{" "}
                  {p.email || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Phone No :</span>{" "}
                  {p.phoneNo || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Gender :</span>{" "}
                  {p.gender || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Age :</span>{" "}
                  {p.age || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Role :</span>{" "}
                  {p.role || "N/A"}</p>
                   <p>
                    <span className='font-semibold text-gray-800'>CreatedAt :</span>{" "}
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
                  </p>

              
                </div>

                 
              
                </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default AllPatients
