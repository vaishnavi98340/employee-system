import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Send, FileText, CheckCircle, Clock as ClockIcon, Ban } from 'lucide-react';
import { cn } from '../lib/utils';
import { LeaveRequest, LeaveBalance, LeaveType } from '../types';

export default function LeavePage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [form, setForm] = useState({
    type: 'CASUAL' as LeaveType,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reason: ''
  });

  useEffect(() => {
    if (!profile) return;
    fetchLeaves();
  }, [profile]);

  const fetchLeaves = async () => {
    if (!profile) return;
    
    try {
      // Fetch Requests
      const reqRes = await fetch(`/api/leaves?empId=${profile.uid}`);
      const reqData = await reqRes.json();
      setRequests(reqData);

      // Fetch Balance
      const balRes = await fetch(`/api/leaves/balance/${profile.uid}`);
      const balData = await balRes.json();
      setBalance(balData);
    } catch (err) {
      console.error("Leave data fetch failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const newRequest: Partial<LeaveRequest> = {
      empId: profile.uid,
      empName: profile.name,
      department: profile.department,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
      status: 'PENDING'
    };

    await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    });
    
    setIsApplying(false);
    setForm({ ...form, reason: '' });
    fetchLeaves();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leave Management</h1>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em] italic">Departmental Absence Registry</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <BalanceCard label="Casual Leave" value={balance?.casual || 0} used={2} color="blue" />
        <BalanceCard label="Sick Leave" value={balance?.sick || 0} used={1} color="slate" />
        <BalanceCard label="Duty Leave" value={balance?.duty || 0} used={4} color="blue-light" />
      </section>

      <div className="flex justify-between items-center bg-white p-4 pr-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
        <div className="flex items-center gap-4 ml-4">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
            <FileText size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Submitted Applications Queue</span>
        </div>
        <button 
          onClick={() => setIsApplying(!isApplying)}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg",
            isApplying 
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none border border-slate-200" 
              : "bg-slate-900 text-white hover:bg-blue-600 shadow-slate-900/10"
          )}
        >
          {isApplying ? 'Discard Draft' : 'New Application'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {isApplying ? (
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Absence Category</label>
                  <select 
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as LeaveType })}
                    className="w-full bg-slate-50 border-slate-100 border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-bold text-slate-700"
                  >
                    <option value="CASUAL">Casual Leave (CL)</option>
                    <option value="SICK">Sick Leave (SL)</option>
                    <option value="DUTY">Duty Leave (DL)</option>
                  </select>
                </div>
                <div className="hidden md:block"></div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Period From</label>
                  <input 
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-50 border-slate-100 border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Period To</label>
                  <input 
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-slate-50 border-slate-100 border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-bold text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Statement of Purpose</label>
                <textarea 
                  rows={4}
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Clearly detail the necessity for this absence..."
                  className="w-full bg-slate-50 border-slate-100 border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all resize-none text-sm leading-relaxed font-medium text-slate-700"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
              >
                <Send size={16} />
                Submit Authorization Request
              </button>
            </form>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50 overflow-hidden">
              {requests.length > 0 ? requests.map((req) => (
                <div key={req.id} className="p-8 hover:bg-slate-50/30 transition-all grid grid-cols-1 md:grid-cols-4 items-center gap-6">
                  <div className="md:col-span-2 flex gap-6 items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      req.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" :
                      req.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {req.status === 'APPROVED' ? <CheckCircle size={24} /> :
                       req.status === 'REJECTED' ? <Ban size={24} /> : <ClockIcon size={24} />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-sm tracking-tight text-slate-900 uppercase">{req.type} LEAVE</h4>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          req.status === 'APPROVED' ? "bg-green-100 text-green-700 border-green-200" :
                          req.status === 'REJECTED' ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {format(new Date(req.startDate), 'MMM dd')} - {format(new Date(req.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] text-slate-500 font-medium italic line-clamp-1">“{req.reason}”</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">Application Date</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{format(new Date(req.createdAt), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
              )) : (
                <div className="py-32 text-center">
                  <FileText className="mx-auto mb-4 text-slate-100" size={48} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Archive Empty</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section className="p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400 border-b border-slate-50 pb-4">Protocol Compliance</h3>
            <ul className="space-y-5">
              <GuidelineItem text="Notify HOD at least 48 hours prior for Casual Leave requests." />
              <GuidelineItem text="Medical certifications required for Sick Leave exceeding 3 consecutive days." />
              <GuidelineItem text="Duty Leave necessitates formal invitation proof uploads." />
              <GuidelineItem text="Authorizations are non-retroactive without emergency override." />
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ label, value, used, color }: any) {
  const colors: any = {
    blue: "text-blue-700 bg-blue-50/50 border-blue-100",
    slate: "text-slate-700 bg-slate-50/50 border-slate-200",
    "blue-light": "text-sky-700 bg-sky-50/50 border-sky-100",
  };
  return (
    <div className={cn("p-8 rounded-3xl border transition-all hover:shadow-md group", colors[color])}>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors">{label}</p>
      <div className="flex items-baseline gap-2 mt-4 mb-1">
        <span className="text-4xl font-bold tracking-tighter text-slate-900 leading-none">{value - used}</span>
        <span className="text-xs font-bold text-slate-300 uppercase leading-none">/ {value}</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60">Verified Balance</p>
    </div>
  );
}

function GuidelineItem({ text }: { text: string }) {
  return (
    <li className="flex gap-4 text-[11px] leading-relaxed text-slate-500">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
      <span className="font-medium">{text}</span>
    </li>
  );
}
