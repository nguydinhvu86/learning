'use client';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('polyglot_token');
    if (!token) return;

    // Initial Fetch
    fetch(`http://${window.location.hostname}:3001/api/v1/notifications/my-alerts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setAlerts(data);
    })
    .catch(() => {});

    // Hook SocketIO
    const socket: Socket = io(`http://${window.location.hostname}:3001`, {
      query: { token }
    });

    socket.on('newNotification', (newNotification) => {
      // Unshift the newly received message to the top
      setAlerts(prev => [newNotification, ...prev]);
      
      // Auto pulse effect or something could be nice here
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const markRead = async (id: string) => {
    const token = localStorage.getItem('polyglot_token');
    await fetch(`http://${window.location.hostname}:3001/api/v1/notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-emerald-600 transition hover:bg-gray-100 rounded-full"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">{unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 font-bold text-gray-800">
            Thông báo ({unreadCount})
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Bạn không có thông báo nào.</div>
            ) : alerts.map(a => (
              <div 
                key={a.id} 
                onClick={() => markRead(a.id)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-emerald-50 transition ${!a.is_read ? 'bg-white' : 'bg-gray-50 opacity-70'}`}
              >
                <div className="flex justify-between items-start">
                  <h4 className={`text-sm ${!a.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{a.title}</h4>
                  {!a.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
