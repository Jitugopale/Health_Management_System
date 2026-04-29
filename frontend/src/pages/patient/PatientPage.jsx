import React from "react";
import LogoutPage from "../auth/LogoutPage";
import { NavLink, Outlet } from "react-router-dom";
import ChatAgentWidget from "./ChatAgentWidget";

const linkBase = "block px-3 py-2 rounded hover:bg-gray-300 transition";
const linkActive = "bg-blue-600 text-white hover:bg-blue-700";
const PatientPage = () => {
  return (
    <>
      <div className="flex">
        <aside className="w-56 bg-gray-200 min-h-screen p-4  space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Patient Panel</h2>
            <LogoutPage />
          </div>

          <nav>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/patient-page"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Book Appointments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/patient-page/my-appointments"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  My Appointments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/patient-page/update-password"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                  end
                >
                  Update Password
                </NavLink>
              </li>
             
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4">
            <Outlet/>
            <ChatAgentWidget/>
        </main>
      </div>
    </>
  );
};

export default PatientPage;
