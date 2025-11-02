import React, { useEffect, useState } from "react";
import API from "../../api";
import { User, Mail, Shield } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await API.get("/protected");
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-700 mt-4 font-medium animate-pulse">
          Loading profile...
        </p>
        <span className="text-xs text-gray-400 mt-1">
          This may take a few seconds
        </span>
      </div>
    );

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-gray-800 animate-fadeIn">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold mt-3">{user.name}</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="text-blue-600" size={20} />
          <p className="text-sm">
            <strong>Name:</strong> {user.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="text-blue-600" size={20} />
          <p className="text-sm break-all">
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Shield className="text-blue-600" size={20} />
          <p className="text-sm capitalize">
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      </div>
    </div>
  );
}
