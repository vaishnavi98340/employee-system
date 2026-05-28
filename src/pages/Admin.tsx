import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Check, X, User, MessageSquare, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { LeaveRequest } from '../types';

export default function AdminPage() {
  const { profile } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchPendingLeaves();
  }, [profile]);

  const fetchPendingLeaves = async () => {
    if (!profile) return;
    setLoading(true);
    
    try {
      let url = '/api/leaves?status=PENDING';
      if (profile.role === 'HOD') {
        url += `&department=${profile.department}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPendingLeaves(data);
    } catch (err) {
      console.error("Pending leaves fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch(`/api/leaves/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        approverId: profile?.uid
      })
    });
    fetchPendingLeaves();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Approvals Queue</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Administrative Authorization Console</p>
        </div>
        <div className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20">
          {pendingLeaves.length} Action{pendingLeaves.length !== 1 ? 's' : ''} Required
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-lg border border-slate-100 text-slate-400">
            <Clock size={14} />
          </div>
          <h2 className="font-bold uppercase tracking-[0.2em] text-[10px] text-slate-500">Waitlist for HOD Clearance</h2>
        </div>

        <div className="divide-y divide-slate-50">
          {pendingLeaves.length > 0 ? pendingLeaves.map((req) => (
            <div key={req.id} className="p-10 hover:bg-slate-50/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-12 group">
              <div className="flex gap-8 items-start">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 border border-slate-800 shadow-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <User size={32} strokeWidth={1.5} className="relative z-10" />
                </div>
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tighter text-slate-900 lowercase first-letter:uppercase">{req.empName}</h3>
                    <p className="text-[10px] text-blue-600 uppercase tracking-[0.2em] font-bold mt-1">
                      {req.department} Faculty • <span className="text-slate-400">{req.type} Leave</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-8 border-l-2 border-slate-100 pl-6 py-1">
                    <AdminDetail label="Commences" value={format(new Date(req.startDate), 'MMM dd, yyyy')} />
                    <AdminDetail label="Concludes" value={format(new Date(req.endDate), 'MMM dd, yyyy')} />
                    <AdminDetail label="Cycle" value="Active Workdays" />
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                    <div className="absolute top-0 right-0 p-3 text-slate-100">
                      <MessageSquare size={24} />
                    </div>
                    <p className="text-xs italic text-slate-600 leading-relaxed relative z-10 font-medium">“{req.reason}”</p>
                  </div>
                </div>
              </div>

              <div className="flex lg:flex-col gap-3 min-w-[200px]">
                <button 
                  onClick={() => handleAction(req.id!, 'APPROVED')}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-lg shadow-blue-600/10 hover:scale-[1.02] active:scale-95"
                >
                  <Check size={18} /> Authorize
                </button>
                <button 
                  onClick={() => handleAction(req.id!, 'REJECTED')}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-500 py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <X size={18} /> Decline
                </button>
              </div>
            </div>
          )) : (
            <div className="py-40 text-center">
              <div className="mb-6 opacity-5 inline-block">
                <Clock size={64} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300">Queue Cleared</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminDetail({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-xs font-bold tracking-tight text-slate-900 uppercase">{value}</p>
    </div>
  );
}
