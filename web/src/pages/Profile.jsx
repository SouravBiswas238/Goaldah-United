import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { User, Camera, Save, Loader, Upload } from "lucide-react";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profile_picture: "",
    blood_group: "",
    role: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        profile_picture: user.profile_picture || "",
        blood_group: user.blood_group || "",
        role: user.role || "",
        status: user.status || "",
      });
      setPreviewUrl(user.profile_picture || "");
    }
  }, [user]);

  // console.log(user)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let currentProfilePic = formData.profile_picture;

      // 1. Upload Image if a new file is selected
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", imageFile);

        const uploadResponse = await api.post(
          "/members/avatar",
          formDataUpload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        currentProfilePic = uploadResponse.data.avatarUrl;
      }

      // 2. Update Profile Data (Name and potentially new Profile Picture URL)
      const response = await api.put(`/members/${user.id}`, {
        name: formData.name,
        profile_picture: currentProfilePic,
        blood_group: formData.blood_group,
      });

      // 3. Update local user state
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Reset file state
      setImageFile(null);

      setMessage({ type: "success", text: "প্রোফাইল সফলভাবে আপডেট হয়েছে!" });
    } catch (error) {
      console.error("Failed to update profile", error);
      const errorMsg =
        error.response?.data?.message || "প্রোফাইল আপডেট করতে ব্যর্থ";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">আমার প্রোফাইল</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div
              className="relative group cursor-pointer"
              onClick={handleImageClick}
            >
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-4 border-white shadow-md transition-transform group-hover:scale-105">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  formData.name?.charAt(0) || "U"
                )}
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm z-10"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {formData.name}
            </h2>
            <p className="text-gray-500 capitalize">{formData.role}</p>
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="আপনার পুরো নাম লিখুন"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  রক্তের গ্রুপ
                </label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
                  <option value="A+">এ+</option>
                  <option value="A-">এ-</option>
                  <option value="B+">বি+</option>
                  <option value="B-">বি-</option>
                  <option value="AB+">এবি+</option>
                  <option value="AB-">এবি-</option>
                  <option value="O+">ও+</option>
                  <option value="O-">ও-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ফোন নম্বর
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  disabled
                  className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  ফোন নম্বর পরিবর্তন করা যাবে না।
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    পরিবর্তন সংরক্ষণ করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
