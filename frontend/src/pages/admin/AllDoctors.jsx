import axios from 'axios';
import React, { useEffect, useState } from 'react'


const AllDoctors = () => {

  const [doctors,setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAllDoctors = async() =>{
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/doctors/all`,{
        headers:{
          "Content-Type":"application/json",
          "auth-token":localStorage.getItem("token")
        }
      })
      setDoctors(res.data.doctors);
    } catch (error) {
      console.error("Error fetching all doctors",error)
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    fetchAllDoctors()
  },[])

 

  if(loading){
    return <p className='text-center mt-5'>Loading Doctors...</p>
  }

  if(!doctors.length){
    return <p className='p-4 text-gray-600'>No Doctors found</p>
  }
  return (
    <>
      <div className='p-4'>
        <h2 className='text-xl font-semibold mb-4'>All Registered Doctors</h2>

        <div className='space-y-4'>
          {doctors.map((d)=>(
              <div key={d.doctorId}
              className='border p-4 rounded-md shadow-sm bg-white'>

                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-xl!'>{d.name}</h3>
                  <span className='text-sm text-gray-600'>
                    ID : {d.doctorId}
                  </span>

                </div>

  

                {/* Doctor Info */}
                <div className='grid md:grid-cols-2 gap-4 mt-3 text-sm'>
                  <p><span className='font-semibold text-gray-800'>Name :</span>{" "}
                  {d.name || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Email :</span>{" "}
                  {d.email || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Phone No :</span>{" "}
                  {d.phoneNo || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Gender :</span>{" "}
                  {d.gender || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Age :</span>{" "}
                  {d.age || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Role :</span>{" "}
                  {d.role || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Specialization :</span>{" "}
                  {d.specialization || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Experience :</span>{" "}
                  {d.experience || "N/A"}</p>
                  <p><span className='font-semibold text-gray-800'>Qualification :</span>{" "}
                  {d.qualification || "N/A"}</p>
                   <p>
                    <span className='font-semibold text-gray-800'>CreatedAt :</span>{" "}
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "N/A"}
                  </p>

              
                </div>

                 
              
                </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default AllDoctors
