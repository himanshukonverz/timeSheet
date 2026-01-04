import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { toast } from "sonner";

function AddEmployee() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      empId: "",
      name: "",
      email: "",
      password: "",
      role: "employee",
      reportsTo: "",
      joiningDate: "",
    },
  });

  const selectedRole = watch("role");

  // Fetch managers/employees for reportsTo dropdown
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        // TODO: Replace with actual API endpoint
        const response = await api.get("/user/admin-manager");
        console.log("response - ", response.data);
        setManagers(response.data.users);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  // Automatically set reportsTo to admin when role is manager
  useEffect(() => {
    if (selectedRole === "manager") {
      // Find the first admin from managers list
      const admin = managers.find((m) => m.role === "admin");
      if (admin) {
        setValue("reportsTo", admin.empId.toString());
      }
    } else if (selectedRole === "employee") {
      // Clear reportsTo when role is employee (user can select manually)
      setValue("reportsTo", "");
    }
  }, [selectedRole, managers, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Prepare payload
      const payload = {
        empId: Number(data.empId),
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        role: data.role,
        joiningDate: data.joiningDate,
        ...(data.reportsTo && { reportsTo: Number(data.reportsTo) }),
      };

      // TODO: Replace with actual API call
      const response = await api.post("/user/create", payload);
      console.log("res - ", response);

      // For now, just log
      console.log("Form data:", payload);
      toast.success("Employee added successfully");

      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to add employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ================= Employee Info ================= */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Employee Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employee ID */}
              <div>
                <label className="form-label">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("empId", {
                    required: "Employee ID is required",
                    valueAsNumber: true,
                  })}
                  className={`form-input ${errors.empId ? "form-error" : ""}`}
                  placeholder="Enter employee ID"
                />
                {errors.empId && (
                  <p className="form-error-text">{errors.empId.message}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="form-label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  className={`form-input ${errors.name ? "form-error" : ""}`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="form-error-text">{errors.name.message}</p>
                )}
              </div>

              {/* ================= Joining Date ================= */}
              <div>
                <label className="form-label">
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("joiningDate", {
                    required: "Joining date is required",
                  })}
                  className={`form-input ${
                    errors.joiningDate ? "form-error" : ""
                  }`}
                />
                {errors.joiningDate && (
                  <p className="form-error-text">
                    {errors.joiningDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================= Account Info ================= */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="form-label">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                  })}
                  className={`form-input ${errors.email ? "form-error" : ""}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="form-error-text">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="form-label">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={`form-input ${
                      errors.password ? "form-error" : ""
                    } pr-10`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error-text">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ================= Role Info ================= */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Role & Reporting
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div>
                <label className="form-label">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("role", { required: true })}
                  className={`form-input ${errors.role ? "form-error" : ""}`}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
                {errors.role && (
                  <p className="form-error-text">{errors.role.message}</p>
                )}
              </div>

              {/* Reports To */}
              {(selectedRole === "employee" || selectedRole === "manager") && (
                <div>
                  <label className="form-label">Reports To</label>
                  <select
                    {...register("reportsTo")}
                    className="form-input"
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    <option value="">Select Manager/Admin</option>
                    {managers.map((manager) => (
                      <option key={manager.empId} value={manager.empId}>
                        {manager.name} ({manager.empId}) - {manager.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ================= Actions ================= */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md
                         hover:bg-blue-700 focus:ring-2 focus:ring-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Adding Employee..." : "Add Employee"}
            </button>

            <button
              type="button"
              onClick={() => reset()}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-md
                         hover:bg-gray-300 focus:ring-2 focus:ring-gray-400
                         disabled:opacity-50 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;
