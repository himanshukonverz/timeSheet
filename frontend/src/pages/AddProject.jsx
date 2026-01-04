import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import { CircleX } from "lucide-react";

function AddProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      projectName: "",
      status: "upcoming",
      startDate: "",
      goLiveDate: "",
      contributors: [
        {
          email: "",
          projectRole: "",
          projectModules: "",
          hasEditAccess: "false",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contributors",
  });

  const status = watch("status");
  const startDate = watch("startDate");
  const isUpcoming = status === "upcoming";

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        projectName: data.projectName.trim(),
        status: data.status,
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.goLiveDate && { goLiveDate: data.goLiveDate }),
        contributors: data.contributors
          .filter(c => c.email) // remove empty contributors
          .map(c => ({
            email: c.email.toLowerCase().trim(),
            projectRole: c.projectRole,
            projectModules: c.projectModules,
            hasEditAccess: c.hasEditAccess === "true",
          })),
      };

      await api.post("/project/create", payload);

      toast.success("Project created successfully");
      reset();
      navigate("/projects");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Add New Project
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Project Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Name of the Project"
                  {...register("projectName", { required: "Project name is required" })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500
                    ${errors.projectName ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.projectName && (
                  <p className="text-sm text-red-600 mt-1">{errors.projectName.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("status", { required: true })}
                  className="form-input w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {!isUpcoming && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("startDate", { required: "Start date is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Go Live Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Go Live Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("goLiveDate", {
                      required: "Go Live date is required",
                      validate: value =>
                        !startDate || value >= startDate || "Go Live date cannot be before Start Date",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contributors */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Contributor Details
            </h2>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4 items-end">
                {/* Email */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contributor Email
                  </label>
                  <input
                    type="email"
                    {...register(`contributors.${index}.email`)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="name@kognozconsulting.com"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Role
                  </label>
                  <select
                    {...register(`contributors.${index}.projectRole`)}
                    className="form-input w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select role</option>
                    <option value="Engagement Manager">Engagement Manager</option>
                    <option value="Implementation Lead">Implementation Lead</option>
                    <option value="Solution Architect">Solution Architect</option>
                    <option value="Module Lead">Module Lead</option>
                    <option value="Integration Lead">Integration Lead</option>
                    <option value="Support Role">Support Role</option>
                    <option value="Project Director">Project Director</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Modules */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Modules
                  </label>
                  <input
                    type="text"
                    {...register(`contributors.${index}.projectModules`)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="All, Core, RnO, L&A, etc."
                  />
                </div>

                {/* Has Edit Access */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Has Edit Access
                    </label>
                    <select
                      {...register(`contributors.${index}.hasEditAccess`)}
                      className="form-input px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>

                  {/* Remove button */}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md mt-6"
                    >
                      <CircleX />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Contributor Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  append({
                    email: "",
                    projectRole: "",
                    projectModules: "",
                    hasEditAccess: "false",
                  })
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Contributor
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddProject;