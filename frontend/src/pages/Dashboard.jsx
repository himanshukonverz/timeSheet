import AdminDashboard from '@/components/AdminDashboard'
import EmployeeDashboard from '@/components/EmployeeDashboard'
import ManagerDashboard from '@/components/ManagerDashboard'
import { useAuth } from '@/context/AuthContext'
import React from 'react'

function Dashboard() {
  const {user} = useAuth()

  console.log("user - ", user)
  return (
    <>
      {user.role === "employee" && <EmployeeDashboard />}
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "manager" && <ManagerDashboard />}
    </>
  )
}

export default Dashboard