import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-5 bg-slate-900 text-white rounded-[2rem] mb-4 shadow-2xl shadow-blue-500/10 border border-slate-800"
          >
            <GraduationCap size={44} className="text-blue-400" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tighter text-slate-900 leading-none">
            Academia <span className="font-light text-blue-500">EMS</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">Enterprise Management System</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
          
          <div className="space-y-3 text-center relative z-10">
            <h2 className="text-2xl font-bold text-slate-900">Faculty Portal</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Synchronize your academic records. Access restricted to institutional Google workspace accounts.
            </p>
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white py-4.5 rounded-2xl font-bold hover:bg-blue-600 transition-all group active:scale-[0.98] shadow-lg shadow-slate-900/10 text-xs uppercase tracking-widest"
          >
            <div className="p-1 bg-white rounded-lg">
              <svg className="w-5 h-5 transition-transform" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" />
                <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            Identification Login
          </button>

          <p className="text-[9px] text-center text-slate-300 uppercase font-bold tracking-[0.3em] pt-4 relative z-10">
            Powered by Academia Cloud Core
          </p>
        </motion.div>
      </div>
    </div>
  );
}
