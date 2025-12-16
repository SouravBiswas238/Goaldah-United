import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Phone, User } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }

    try {
      await register({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            অ্যাকাউন্ট তৈরি করুন
          </h2>
          <p className="text-gray-500 mt-2">আজই গোয়ালদহ ইউনাইটেডে যোগ দিন</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পুরো নাম
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="আপনার নাম"
                required
              />
            </div>
          </div>

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
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="একটি পাসওয়ার্ড তৈরি করুন"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="আপনার পাসওয়ার্ড নিশ্চিত করুন"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            অ্যাকাউন্ট তৈরি করুন
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            সাইন ইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
