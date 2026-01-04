import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { CircleX, X } from "lucide-react";
import { toast } from "sonner";

function AddContributorsModal({ projectId, onClose }) {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
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

  const onSubmit = async (data) => {
    try {
      const payload = data.contributors
        .filter((c) => c.email)
        .map((c) => ({
          email: c.email.toLowerCase().trim(),
          projectRole: c.projectRole,
          projectModules: c.projectModules,
          hasEditAccess: c.hasEditAccess === "true",
        }));

      if (!payload.length) {
        toast.error("Add at least one contributor");
        return;
      }

      console.log("PROJECT ID:", projectId);
      console.log("PAYLOAD:", payload);

      // 🔜 API call later
      // await api.post(`/project/${projectId}/contributors`, payload);

      toast.success("Contributors added successfully");
      reset();
      onClose();
    } catch (err) {
      toast.error("Failed to add contributors");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl max-h-[70vh] overflow-y-scroll rounded-lg shadow-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Contributors</h2>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              {/* Email */}
              <div>
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
                  <option value="Implementation Lead">
                    Implementation Lead
                  </option>
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

              {/* Edit Access */}
              <div className="flex gap-2 items-end">
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

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 mb-2"
                  >
                    <CircleX />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add More */}
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
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              + Add Another
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md"
            >
              Save Contributors
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddContributorsModal;
