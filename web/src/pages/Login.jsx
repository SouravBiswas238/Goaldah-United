import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Phone } from "lucide-react";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(phone, password);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">স্বাগতম</h2>
          <p className="text-gray-500 mt-2">আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ফোন নম্বর
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="আপনার ফোন নম্বর লিখুন"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            সাইন ইন
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            নিবন্ধন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
