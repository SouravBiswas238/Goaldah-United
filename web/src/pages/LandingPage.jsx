import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, Calendar } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Goaldah United
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-600/20"
              >
                যোগ দিন
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8">
            আপনার গ্রামকে পরিচালনা করুন <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              আত্মবিশ্বাসের সাথে
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            সম্প্রদায় পরিচালনার জন্য একটি আধুনিক প্ল্যাটফর্ম। ইভেন্ট সংগঠিত
            করুন, সদস্যদের পরিচালনা করুন এবং অবদান ট্র্যাক করুন।
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="group bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center"
            >
              শুরু করুন
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="bg-gray-50 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all border border-gray-200"
            >
              সাইন ইন
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                সদস্য পরিচালনা
              </h3>
              <p className="text-gray-500">
                সম্প্রদায়ের মধ্যে সদস্যদের প্রোফাইল, ভূমিকা এবং স্ট্যাটাস সহজেই
                পরিচালনা করুন।
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ইভেন্ট পরিকল্পনা
              </h3>
              <p className="text-gray-500">
                সম্প্রদায়ের ইভেন্ট, মিটিং এবং সমাবেশ সহজেই সংগঠিত এবং ট্র্যাক
                করুন।
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                নিরাপদ এবং ব্যক্তিগত
              </h3>
              <p className="text-gray-500">
                আপনার সম্প্রদায়ের ডেটা এন্টারপ্রাইজ-গ্রেড নিরাপত্তা মানদণ্ড
                দিয়ে সুরক্ষিত।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
