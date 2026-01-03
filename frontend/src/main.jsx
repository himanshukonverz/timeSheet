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
          <Route 
            path="timesheet"
            element={
              <ProtectedRoute>
                <Timesheet />
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
