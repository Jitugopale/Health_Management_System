import React from "react";
import LogoutPage from "../auth/LogoutPage";
import { NavLink, Outlet } from "react-router-dom";

const linkBase = "block px-3 py-2 rounded hover:bg-gray-300 transition";
const linkActive = "bg-blue-600 text-white hover:bg-blue-700";
const AdminPage = () => {
  return (
    <>
      <div className="flex">
        <aside className="w-56 bg-gray-200 min-h-screen p-4  space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Admin Panel</h2>
            <LogoutPage />
          </div>

          <nav>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/admin-page"
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
                  to="/admin-page/create-doctors"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Create Doctors
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-page/pending-appointments"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Pending Appointments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-page/rejected-appointments"
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
                  to="/admin-page/booked-appointments"
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
                  to="/admin-page/patients-all"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Patients
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-page/doctors-all"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Doctors
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

export default AdminPage;
