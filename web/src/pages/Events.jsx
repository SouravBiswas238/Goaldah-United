import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, MapPin, Clock } from 'lucide-react';

const MemberEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${event.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                                    event.type === 'sports' ? 'bg-green-100 text-green-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {event.type}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{event.description}</p>

                        <div className="space-y-2">
                            <div className="flex items-center text-gray-500 text-sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-2" />
                                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-gray-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No upcoming events found.
                </div>
            )}
        </div>
    );
};

export default MemberEvents;
