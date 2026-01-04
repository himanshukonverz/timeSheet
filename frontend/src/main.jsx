import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Timesheet from "./pages/Timesheet";

import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import ViewTimesheet from "./components/ViewTimesheet";
import FillTimesheet from "./components/FillTimesheet";
import Projects from "./pages/Projects";
import AddEmployee from "./pages/AddEmployee";
import AddProject from "./pages/AddProject";
import Profile from "./pages/MyProfile";

ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />}>

          <Route 
            path=""
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Employee */}
          <Route 
            path="view-timesheet"
            element={
              <ProtectedRoute>
                <ViewTimesheet />
              </ProtectedRoute>
            }
          />

          {/* Employee + Manager */}
          <Route 
            path="fill-timesheet"
            element={
              <ProtectedRoute>
                <FillTimesheet />
              </ProtectedRoute>
            }
          />

          {/* Manager */}
          <Route 
            path="reportees-timesheet"
            element={
              <ProtectedRoute>
                <ViewTimesheet />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route 
            path="employee-timesheet"
            element={
              <ProtectedRoute>
                <ViewTimesheet />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="add-employee"
            element={
              <ProtectedRoute>
                <AddEmployee />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route 
            path="add-new-project"
            element={
              <ProtectedRoute>
                <AddProject />
              </ProtectedRoute>
            }
          />

          <Route 
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  </BrowserRouter>
);
