import React from "react";
import LogoutPage from "../auth/LogoutPage";
import { NavLink, Outlet } from "react-router-dom";

const linkBase = "block px-3 py-2 rounded hover:bg-gray-300 transition";
const linkActive = "bg-blue-600 text-white hover:bg-blue-700";
const DoctorPage = () => {
  return (
    <>
      <div className="flex">
        <aside className="w-56 bg-gray-200 min-h-screen p-4  space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Doctor Panel</h2>
            <LogoutPage />
          </div>

          <nav>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/doctor-page"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-page/appointments-pending"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Appointments Pending
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-page/all-appointments-booked"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Booked Appointments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-page/all-appointments-rejected"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Rejected Appointments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-page/update-password"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Update Password
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-page/update-info"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Update Info
                </NavLink>
              </li>
             
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4">
            <Outlet/>
        </main>
      </div>
    </>
  );
};

export default DoctorPage;
