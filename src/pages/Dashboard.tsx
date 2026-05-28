import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Attendance } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    attendanceToday: 'Not Marked',
    leavesPending: 0,
    totalWorkingDays: 22,
  });
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    if (!profile) return;

    const fetchStats = async () => {
      try {
        // Fetch stats from API
        const today = format(new Date(), 'yyyy-MM-dd');
        const attRes = await fetch(`/api/attendance?empId=${profile.uid}&date=${today}`);
        const attData = await attRes.json();
        if (attData.length > 0) {
          setStats(prev => ({ ...prev, attendanceToday: attData[0].status }));
        }

        const leaveRes = await fetch(`/api/leaves?empId=${profile.uid}&status=PENDING`);
        const leaveData = await leaveRes.json();
        setStats(prev => ({ ...prev, leavesPending: leaveData.length }));

        const historyRes = await fetch(`/api/attendance?empId=${profile.uid}`);
        const historyData = await historyRes.json();
        setRecentAttendance(historyData.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      }
    };

    fetchStats();
  }, [profile]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm font-medium">Welcome back, <span className="text-slate-900 font-bold">{profile?.name}</span> • {profile?.department} Dept.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Clock} 
          label="Presence Status" 
          value={stats.attendanceToday} 
          color="bg-blue-600" 
          subValue={stats.attendanceToday === 'PRESENT' ? 'On Time' : stats.attendanceToday === 'LATE' ? 'Action Logged' : 'Awaiting Entry'}
        />
        <StatCard 
          icon={Calendar} 
          label="Pending Leaves" 
          value={stats.leavesPending.toString()} 
          color="bg-slate-900" 
          subValue="Requires HOD Approval"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Faculty Attendance" 
          value="94%" 
          color="bg-emerald-600" 
          subValue="Running Avg. this Month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Attendance */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Recent Activity Logs</h2>
            <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAttendance.length > 0 ? recentAttendance.map((record) => (
              <div key={record.id} className="px-6 py-4 flex items-center hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 mr-4 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{format(new Date(record.date), 'EEEE, MMM d')}</p>
                  <p className="text-xs text-slate-500 font-medium">Logged at Campus Gateway</p>
                </div>
                <div className="text-right mr-8">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '--:--'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Check-in</p>
                </div>
                <StatusBadge status={record.status} />
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400 font-medium text-xs uppercase tracking-widest italic">
                No activity records found.
              </div>
            )}
          </div>
        </section>

        {/* Quick Links / Announcement */}
        <div className="space-y-6">
          <section className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-60">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Update</span>
              </div>
              <h3 className="text-lg font-bold leading-tight mb-3">Internal Academic Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Internal review commences next Tuesday. Ensure lecture logs & attendance records are synchronized.
              </p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                Read Full Guidelines →
              </button>
            </div>
          </section>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4 text-[10px] uppercase tracking-widest text-slate-400">Administrative Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-900 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Submit Leave
              </button>
              <button className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-900 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Timetable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subValue }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-2.5 rounded-xl text-white shadow-lg", color)}>
          <Icon size={20} />
        </div>
        <div className="h-1 w-8 bg-slate-100 rounded-full group-hover:bg-blue-200 transition-colors" />
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide italic">{subValue}</p>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-700",
    LATE: "bg-red-100 text-red-700",
    ABSENT: "bg-slate-100 text-slate-700",
    HALF_DAY: "bg-blue-100 text-blue-700",
    DEFAULT: "bg-slate-100 text-slate-600"
  };
  return (
    <span className={cn(
      "px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-widest shrink-0 border border-transparent", 
      styles[status] || styles.DEFAULT
    )}>
      {status}
    </span>
  );
}
