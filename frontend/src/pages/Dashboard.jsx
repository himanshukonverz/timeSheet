import EmployeeDashboard from '@/components/EmployeeDashboard'
import { useAuth } from '@/context/AuthContext'
import React from 'react'

function Dashboard() {
  const {user} = useAuth()

  console.log("user - ", user)
  return (
    <>
      {user.role === "employee" && <EmployeeDashboard />}
    </>
  )
}

export default Dashboard