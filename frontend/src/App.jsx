
import './App.css'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import AdminPage from './pages/admin/AdminPage'
import PatientPage from './pages/patient/PatientPage'
import DoctorPage from './pages/doctor/DoctorPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import CreateDoctors from './pages/admin/CreateDoctors'
import PendingAppointments from './pages/admin/PendingAppointments'
import RejectedAppointments from './pages/admin/RejectedAppointments'
import BookedAppointments from './pages/admin/BookedAppointments'
import AllPatients from './pages/admin/AllPatients'
import AllDoctors from './pages/admin/AllDoctors'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AppointmentsPending from './pages/doctor/AppointmentsPending'
import AllBookedAppointments from './pages/doctor/AllBookedAppointments'
import AllRejectedAppointments from './pages/doctor/AllRejectedAppointments'
import UpdateDoctorPassword from './pages/doctor/UpdateDoctorPassword'
import UpdatedoctorInfo from './pages/doctor/UpdatedoctorInfo'
import BookAppointments from './pages/patient/BookAppointments'
import MyAppointments from './pages/patient/MyAppointments'
import UpdatePatientPassword from './pages/patient/UpdatePatientPassword'

function App() {

  return (
    <>
     <Router>
        <Routes>
            <Route path="/" element={<RegisterPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/admin-page" element={<AdminPage/>}>
               <Route index element={<AdminDashboard/>}/>
               <Route path='create-doctors' element={<CreateDoctors/>}/>
               <Route path='pending-appointments' element={<PendingAppointments/>}/>
               <Route path='rejected-appointments' element={<RejectedAppointments/>}/>
               <Route path='booked-appointments' element={<BookedAppointments/>}/>
               <Route path='patients-all' element={<AllPatients/>}/>
               <Route path='doctors-all' element={<AllDoctors/>}/>
            </Route>

            <Route path="/patient-page" element={<PatientPage/>}>
               <Route index element={<BookAppointments/>}/>
               <Route path='my-appointments' element={<MyAppointments/>}/>
               <Route path='update-password' element={<UpdatePatientPassword/>}/>
            </Route>

            <Route path="/doctor-page" element={<DoctorPage/>}>
                <Route index element={<DoctorDashboard/>}/>
               <Route path='appointments-pending' element={<AppointmentsPending/>}/>
               <Route path='all-appointments-booked' element={<AllBookedAppointments/>}/>
               <Route path='all-appointments-rejected' element={<AllRejectedAppointments/>}/>
               <Route path='update-password' element={<UpdateDoctorPassword/>}/>
               <Route path='update-info' element={<UpdatedoctorInfo/>}/>
            </Route>
        </Routes>
     </Router>
    </>
  )
}

export default App
