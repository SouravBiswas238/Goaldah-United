import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { Plus, Calendar, MapPin, Trash2, Edit2 } from "lucide-react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "meeting",
    description: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/events", formData);
      setShowModal(false);
      setFormData({ title: "", date: "", type: "meeting", description: "" });
      fetchEvents();
    } catch (error) {
      console.error("Failed to create event", error);
      alert("Failed to create event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ইভেন্ট পরিচালনা</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          ইভেন্ট তৈরি করুন
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    event.type === "meeting"
                      ? "bg-purple-100 text-purple-700"
                      : event.type === "sports"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {event.type === "meeting"
                    ? "মিটিং"
                    : event.type === "sports"
                    ? "ক্রীড়া"
                    : event.type === "cleanup"
                    ? "পরিচ্ছন্নতা"
                    : "অন্যান্য"}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="flex items-center text-gray-500 text-sm mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(event.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">নতুন ইভেন্ট তৈরি করুন</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  শিরোনাম
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  তারিখ
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ধরন
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="meeting">মিটিং</option>
                  <option value="sports">ক্রীড়া</option>
                  <option value="cleanup">পরিচ্ছন্নতা</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  বিবরণ
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  ইভেন্ট তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
