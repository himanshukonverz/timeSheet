import React, { useEffect, useState } from "react";
import api from "../api/axios";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfileData = async () => {
    try {
      const res = await api.get("/user/profile");
      console.log("res - ", res)
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfileData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <span className="text-gray-500">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={profile.profilePic}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {profile.name}
        </h1>

        {/* Email */}
        <p className="text-center text-gray-600 mb-6">
          {profile.email}
        </p>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Employee ID
            </label>
            <p className="text-gray-800 font-medium">
              {profile.empId || "—"}
            </p>
          </div>

          {/* Date of Joining */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Date of Joining
            </label>
            <p className="text-gray-800 font-medium">
              {profile.joiningDate
                ? new Date(profile.joiningDate).toLocaleDateString()
                : "-"}
            </p>
          </div>

          {/* Reports To */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Reports To
            </label>
            <p className="text-gray-800 font-medium">
              {profile.reportsTo || "—"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;