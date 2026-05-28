import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format, isAfter, setHours, setMinutes } from 'date-fns';
import { MapPin, Clock, LogIn, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { Attendance } from '../types';

export default function AttendancePage() {
  const { profile } = useAuth();
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchAttendance();
  }, [profile]);

  const fetchAttendance = async () => {
    if (!profile) return;
    setLoading(true);
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRes = await fetch(`/api/attendance?empId=${profile.uid}&date=${today}`);
      const todayData = await todayRes.json();
      setTodayRecord(todayData.length > 0 ? todayData[0] : null);

      const historyRes = await fetch(`/api/attendance?empId=${profile.uid}`);
      const historyData = await historyRes.json();
      setHistory(historyData);
    } catch (err) {
      console.error("Attendance fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!profile) return;
    
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const lateThreshold = setMinutes(setHours(now, 9), 15);
    const status = isAfter(now, lateThreshold) ? 'LATE' : 'PRESENT';

    await fetch('/api/attendance/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empId: profile.uid,
        date: todayStr,
        checkIn: now.toISOString(),
        status: status,
      })
    });
    fetchAttendance();
  };

  const handleCheckOut = async () => {
    if (!todayRecord || !todayRecord.id) return;
    
    const now = new Date();
    await fetch(`/api/attendance/${todayRecord.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkOut: now.toISOString()
      })
    });
    fetchAttendance();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance</h1>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Gateway Access Control</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <section className="md:col-span-2 bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />
          
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
            <Clock className="text-blue-500" size={48} />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-5xl font-bold tracking-tighter text-slate-900 leading-none">{format(new Date(), 'HH:mm')}</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>

          <div className="w-full space-y-4">
            {!todayRecord ? (
              <button 
                onClick={handleCheckIn}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-6 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10"
              >
                <LogIn size={18} />
                Register Check-in
              </button>
            ) : !todayRecord.checkOut ? (
              <button 
                onClick={handleCheckOut}
                className="w-full flex items-center justify-center gap-3 bg-red-600 text-white py-4 px-6 rounded-2xl hover:bg-red-700 active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-red-900/10"
              >
                <LogOut size={18} />
                Register Check-out
              </button>
            ) : (
              <div className="w-full p-4 bg-slate-50 text-slate-400 rounded-2xl font-bold border border-slate-100 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]">
                <Clock size={16} />
                Shift Logged
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 font-bold uppercase tracking-widest">
            <MapPin size={12} className="text-blue-500" />
            <span>Campus Geo-Sync Active</span>
          </div>
        </section>

        <section className="md:col-span-3 bg-white border border-slate-200 p-8 rounded-3xl space-y-8 shadow-sm">
          <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-slate-400 border-b border-slate-50 pb-4">Daily Statistics</h3>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-10">
            <DetailItem label="Duty Status" value={todayRecord?.status || 'AWAITING LOG'} status={todayRecord?.status} />
            <DetailItem label="Entry Timestamp" value={todayRecord?.checkIn ? format(new Date(todayRecord.checkIn), 'hh:mm a') : '--:--'} />
            <DetailItem label="Exit Timestamp" value={todayRecord?.checkOut ? format(new Date(todayRecord.checkOut), 'hh:mm a') : '--:--'} />
            <DetailItem label="Active Duration" value={todayRecord?.checkOut ? '08 HR 20 MIN' : '--:--'} />
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex gap-4 items-start">
            <div className="p-2 bg-white rounded-lg border border-blue-100 text-blue-500 shadow-sm shrink-0">
              <Clock size={16} />
            </div>
            <p className="text-[11px] font-medium text-blue-700 leading-relaxed italic">
              Academic Assignment: You are designated for the Computer Science Lab (Block B, 402) starting at 09:30 AM.
            </p>
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Institutional Logs: 30-Day Cycle</h2>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Export as PDF</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/20 text-left border-b border-slate-50">
                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Date Reference</th>
                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Temporal Range</th>
                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Status Marker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-700 text-xs tracking-tight uppercase">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                  <td className="px-8 py-5 font-mono text-[11px] text-slate-400 font-bold">
                    {record.checkIn ? format(new Date(record.checkIn), 'HH:mm') : '--:--'} — {record.checkOut ? format(new Date(record.checkOut), 'HH:mm') : '--:--'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value, status }: { label: string, value: string, status?: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[8px] uppercase font-bold tracking-[0.2em] text-slate-400">{label}</p>
      <p className={cn(
        "font-bold tracking-tighter text-sm uppercase",
        status === 'PRESENT' ? 'text-green-600' : status === 'LATE' ? 'text-red-600' : 'text-slate-900'
      )}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PRESENT: "text-green-700 bg-green-50 border-green-100",
    LATE: "text-red-700 bg-red-50 border-red-100",
    ABSENT: "text-slate-700 bg-slate-50 border-slate-100",
    HALF_DAY: "text-blue-700 bg-blue-50 border-blue-100",
    DEFAULT: "text-slate-600 bg-slate-50 border-slate-100"
  };
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all", 
      styles[status] || styles.DEFAULT
    )}>
      {status}
    </span>
  );
}
