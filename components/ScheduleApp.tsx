'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

import {
  TEAM_MEMBERS,
  ABSENCE_CONFIG,
  MONTHS,
  AbsenceType,
} from '../types/schedule';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  X,
  ClipboardPaste,
  Users,
  Clock,
  Printer,
  Eye,
  MousePointer2,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  Search,
  Lock,
  Unlock,
  Undo2,
  MessageSquare,
} from 'lucide-react';

const firebaseConfig = {
  apiKey: 'AIzaSyCY4SbHnB-yEKwk0wfG9yM4WNver0cLF2Y',
  authDomain: 'gestao-calendario-4ddba.firebaseapp.com',
  databaseURL: 'https://gestao-calendario-4ddba-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'gestao-calendario-4ddba',
  storageBucket: 'gestao-calendario-4ddba.firebasestorage.app',
  messagingSenderId: '307690076999',
  appId: '1:307690076999:web:8b301a8ed9780cf3082a62',
  measurementId: 'G-6KV859V7Z8',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const COLORS: Record<AbsenceType, string> = {
  Trabalho: 'bg-slate-50/50 text-slate-400 border-slate-200 hover:bg-white hover:shadow-sm',
  Folga: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-white/20 shadow-lg shadow-orange-500/20 ring-1 ring-white/10',
  Férias: 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white border-white/20 shadow-lg shadow-emerald-500/20 ring-1 ring-white/10',
  'Gozo Feriado': 'bg-gradient-to-br from-rose-400 to-red-600 text-white border-white/20 shadow-lg shadow-rose-500/20 ring-1 ring-white/10',
  'Visita Guiada': 'bg-gradient-to-br from-indigo-400 to-violet-600 text-white border-white/20 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10',
  Feira: 'bg-gradient-to-br from-orange-400 to-yellow-600 text-white border-white/20 shadow-lg shadow-orange-500/20 ring-1 ring-white/10',
  Formação: 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white border-white/20 shadow-lg shadow-blue-500/20 ring-1 ring-white/10',
  'Serviço Externo': 'bg-gradient-to-br from-slate-500 to-slate-700 text-white border-white/20 shadow-lg shadow-slate-500/20 ring-1 ring-white/10',
  'Baixa Médica': 'bg-gradient-to-br from-red-500 to-rose-700 text-white border-white/20 shadow-lg shadow-red-500/20 ring-1 ring-white/10',
  'Trabalhador-Estudante': 'bg-gradient-to-br from-lime-400 to-green-600 text-white border-white/20 shadow-lg shadow-lime-500/20 ring-1 ring-white/10',
  'Consulta Médica': 'bg-gradient-to-br from-cyan-400 to-sky-600 text-white border-white/20 shadow-lg shadow-cyan-500/20 ring-1 ring-white/10',
  'Banco de Horas': 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white border-white/20 shadow-lg shadow-yellow-500/20 ring-1 ring-white/10',
  'Tolerância de Ponto': 'bg-gradient-to-br from-fuchsia-400 to-pink-600 text-white border-white/20 shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/10',
};

const MEMBER_HOURS: Record<string, { am: string; pm: string }> = {
  'Ana Cristina': { am: '09:00-12:00', pm: '13:15-17:15' },
  'Carlos Malheiro': { am: '09:30-12:30', pm: '14:30-18:30' },
  'Cristiana Silva': { am: '09:15-13:15', pm: '14:30-17:30' },
  'Carla Vides': { am: '09:00-12:00', pm: '13:15-17:15' },
  'Hugo Barros': { am: '09:15-13:15', pm: '14:30-17:30' },
  'Joana Situ': { am: '09:00-12:00', pm: '13:15-17:15' },
  'Mário Malheiro': { am: '09:30-12:30', pm: '14:30-18:30' },
  'Pedro Abreu': { am: '09:30-12:30', pm: '14:30-18:30' },
  'Paula Rodrigues': { am: '09:15-13:15', pm: '14:30-17:30' },
  'Soraia Pinto': { am: '09:00-12:00', pm: '13:15-17:15' },
  'Serafim Torres': { am: '09:15-13:15', pm: '14:30-17:30' },
  'Tiago Pinto': { am: '09:15-13:15', pm: '14:30-17:30' },
  'Vitor Afonso': { am: '09:30-12:30', pm: '14:30-18:30' },
};

export default function ScheduleApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [year] = useState(2026);
  const [scheduleData, setScheduleData] = useState<Record<string, any>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedType, setSelectedType] = useState<AbsenceType>('Folga');
  const [highlightFilter, setHighlightFilter] = useState<AbsenceType | null>(null);
  const [clipboardData, setClipboardData] = useState<Record<string, any> | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<any | null>(null);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [noteModal, setNoteModal] = useState<{ show: boolean; member: string; day: number; type: AbsenceType } | null>(null);
  const [tempNote, setTempNote] = useState('');

  const today = new Date();
  const isThisMonth = today.getMonth() === currentMonth && today.getFullYear() === year;
  const currentDayNumber = today.getDate();

  useEffect(() => {
    const scheduleRef = ref(db, 'escala_2026');
    const unsubscribe = onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setScheduleData(data);
      setIsDataLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const saveToFirebase = (data: Record<string, any>) => {
    set(ref(db, 'escala_2026'), data).catch(() => showToast('Erro ao sincronizar', 'error'));
  };

  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const getStatus = (member: string, day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const res = scheduleData[`${member}-2026-${m}-${d}`];
    return res || 'Trabalho';
  };

  const toggleDayStatus = (member: string, day: number) => {
    if (isLocked) { showToast('Escala bloqueada!', 'error'); return; }
    
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const key = `${member}-2026-${m}-${d}`;
    const current = scheduleData[key];
    const currentType = typeof current === 'object' && current !== null ? current.type : (current || 'Trabalho');

    setHistory((prev) => [scheduleData, ...prev.slice(0, 19)]);
    const newDocs = { ...scheduleData };
    const typesWithNotes: AbsenceType[] = ['Banco de Horas', 'Tolerância de Ponto', 'Gozo Feriado', 'Visita Guiada', 'Feira', 'Formação', 'Serviço Externo'];

    if (selectedType === 'Consulta Médica' || selectedType === 'Trabalhador-Estudante') {
      if (currentType !== selectedType) {
        newDocs[key] = { type: selectedType, period: 'Morning' };
      } else if (typeof current === 'object' && current.period === 'Morning') {
        newDocs[key] = { type: selectedType, period: 'Afternoon' };
      } else if (typeof current === 'object' && current.period === 'Afternoon') {
        newDocs[key] = { type: selectedType, period: 'Full' };
      } else { 
        delete newDocs[key]; 
      }
    } 
    else if (typesWithNotes.includes(selectedType)) {
      if (currentType === selectedType) {
         setTempNote(current.note || '');
         setNoteModal({ show: true, member, day, type: selectedType });
         return;
      } else {
        setTempNote('');
        setNoteModal({ show: true, member, day, type: selectedType });
        return;
      }
    } 
    else {
      if (currentType === selectedType) {
        delete newDocs[key];
      } else {
        newDocs[key] = selectedType;
      }
    }

    setScheduleData(newDocs);
    saveToFirebase(newDocs);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previous = history[0];
      setScheduleData(previous);
      saveToFirebase(previous);
      setHistory((prev) => prev.slice(1));
      showToast('Ação revertida!');
    }
  };

  const copyMemberSchedule = (member: string) => {
    const memberData: { [key: string]: any } = {};
    const m = String(currentMonth + 1).padStart(2, '0');
    daysArray.forEach((day) => {
      const d = String(day).padStart(2, '0');
      const key = `${member}-2026-${m}-${d}`;
      if (scheduleData[key]) memberData[day] = scheduleData[key];
    });
    setClipboardData(memberData);
    showToast(`Escala de ${member} copiada!`);
  };

  const pasteMemberSchedule = (targetMember: string) => {
    if (!clipboardData || isLocked) return;
    setHistory((prev) => [scheduleData, ...prev.slice(0, 19)]);
    const newDocs = { ...scheduleData };
    const m = String(currentMonth + 1).padStart(2, '0');
    daysArray.forEach((day) => {
      const d = String(day).padStart(2, '0');
      delete newDocs[`${targetMember}-2026-${m}-${d}`];
    });
    Object.entries(clipboardData).forEach(([day, type]) => {
      const d = String(day).padStart(2, '0');
      newDocs[`${targetMember}-2026-${m}-${d}`] = type;
    });
    setScheduleData(newDocs);
    saveToFirebase(newDocs);
    showToast(`Escala aplicada a ${targetMember}!`);
  };

  const dailyAnalysis = useMemo(() => {
    return daysArray.map((day) => {
      let currentTotalPresent = TEAM_MEMBERS.length;
      TEAM_MEMBERS.forEach((m) => {
        const status = getStatus(m, day);
        if (status !== 'Trabalho') {
          if (typeof status === 'object' && status !== null) {
            if (status.period === 'Morning' || status.period === 'Afternoon') currentTotalPresent -= 0.5;
            else currentTotalPresent -= 1;
          } else currentTotalPresent -= 1;
        }
      });
      const staffFullPresent = TEAM_MEMBERS.filter((m) => {
        const status = getStatus(m, day);
        if (status === 'Trabalho') return true;
        if (typeof status === 'object' && status.period === 'Afternoon') return true;
        return false;
      });
      const groupsByTime: Record<string, string[]> = { '09:00': [], '09:15': [], '09:30': [] };
      staffFullPresent.forEach((m) => {
        const start = MEMBER_HOURS[m]?.am.split('-')[0];
        if (groupsByTime[start]) groupsByTime[start].push(m);
      });
      const hasShortShift = Object.values(groupsByTime).some(members => members.length < 2);
      return { day, totalPresent: currentTotalPresent, isShort: currentTotalPresent < 3 || hasShortShift, groupsByTime };
    });
  }, [daysArray, scheduleData]);

  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  return (
    <div className="flex h-screen bg-[#F0F4F8] text-slate-900 font-sans overflow-hidden">
      <AnimatePresence>
        {noteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
              <h3 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">Motivo / Detalhe</h3>
              <p className="text-slate-500 text-sm mb-6 font-bold">{ABSENCE_CONFIG[noteModal.type].label} para {noteModal.member}</p>
              <textarea
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-6 shadow-inner"
                rows={3}
                placeholder="Escreva o detalhe aqui..."
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={() => setNoteModal(null)} className="flex-1 py-4 rounded-xl text-slate-500 font-black uppercase text-xs hover:bg-slate-100 transition-all">Fechar</button>
                <button
                  onClick={() => {
                    const m = String(currentMonth + 1).padStart(2, '0');
                    const d = String(noteModal.day).padStart(2, '0');
                    const key = `${noteModal.member}-2026-${m}-${d}`;
                    if (tempNote.trim() === '') {
                        const newDocs = { ...scheduleData };
                        delete newDocs[key];
                        setScheduleData(newDocs);
                        saveToFirebase(newDocs);
                    } else {
                        const newData = { ...scheduleData, [key]: { type: noteModal.type, period: 'Full', note: tempNote } };
                        setScheduleData(newData);
                        saveToFirebase(newData);
                    }
                    setNoteModal(null);
                  }}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-slate-800 transition-all"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ y: -100, x: '-50%', opacity: 0 }} animate={{ y: 24, x: '-50%', opacity: 1 }} exit={{ y: -100, x: '-50%', opacity: 0 }} className="fixed left-1/2 z-[1000]">
            <div className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] shadow-2xl border backdrop-blur-xl ${toast.type === 'success' ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-rose-600/90 border-rose-500 text-white'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold tracking-tight">{toast.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDayDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-3xl overflow-hidden border border-slate-100">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-12 text-white flex justify-between items-start relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-4xl font-black tracking-tighter uppercase mb-1">Dia {selectedDayDetails.day}</h3>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em] opacity-80">{MONTHS[currentMonth]} 2026</p>
                </div>
                <button onClick={() => setSelectedDayDetails(null)} className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all relative z-10"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-6 max-h-[55vh] overflow-y-auto custom-scrollbar">
                {Object.entries(selectedDayDetails.groupsByTime).map(([time, members]: any) => (
                  <div key={time} className="group bg-slate-50/50 p-7 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Clock size={18} /></div>
                        <span className="text-md font-black text-slate-800 tracking-tight">Entrada {time}</span>
                      </div>
                      <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${members.length < 2 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{members.length} Presentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {members.length > 0 ? members.map((n: string) => <span key={n} className="bg-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm border border-slate-100 text-slate-700">{n}</span>) : <span className="text-slate-400 text-xs italic ml-1">Nenhum colaborador alocado.</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPrintMode && (
        <aside className="w-[340px] bg-[#0F172A] border-r border-white/5 flex flex-col z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.6)]">
          <div className="p-10 border-b border-white/5 bg-slate-900/50 relative overflow-hidden">
             <div className="bg-white/5 p-4 rounded-[2rem] mb-8 flex justify-center backdrop-blur-md border border-white/10 shadow-2xl relative">
                <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src="https://i.imgur.com/REOtXYt.png" alt="Logo" className="h-24 object-contain brightness-0 invert drop-shadow-2xl" />
            </div>
            <div className="flex items-center gap-2.5 mb-2 relative">
              <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]"><ShieldCheck size={12} className="text-white" /></div>
              <h1 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Escalas 2026</h1>
            </div>
            <p className="text-xl font-black text-white leading-tight tracking-tight relative uppercase">Divisão de Economia e Turismo</p>
          </div>
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar-dark">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors"><Search size={16} /></div>
              <input type="text" placeholder="Procurar colaborador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all hover:bg-white/10" />
            </div>
            <section>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2.5 mb-6"><MousePointer2 size={14} className="text-blue-500" /> Pincel de Edição</h3>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(ABSENCE_CONFIG) as AbsenceType[]).map((type) => (
                  <motion.button key={type} whileHover={{ x: 6, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedType(type)} className={`flex items-center justify-between p-4 rounded-[1.4rem] border transition-all duration-300 relative overflow-hidden ${selectedType === type ? COLORS[type] + ' border-white/30 ring-1 ring-white/20 shadow-xl' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 border-white/30 ${COLORS[type].split(' ')[0]}`} />
                      <span className="text-[11px] font-black tracking-widest uppercase">{ABSENCE_CONFIG[type].label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9]">
        <header className="px-12 py-8 bg-white/80 backdrop-blur-2xl border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="bg-slate-200/50 p-1.5 rounded-[1.8rem] flex items-center shadow-inner border border-slate-300/30">
              <button onClick={() => setCurrentMonth((p) => Math.max(0, p - 1))} className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-black text-slate-800 w-56 text-center uppercase tracking-tighter">{MONTHS[currentMonth]} <span className="text-blue-600">{year}</span></h2>
              <button onClick={() => setCurrentMonth((p) => Math.min(11, p + 1))} className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all"><ChevronRight size={20} /></button>
            </div>
            {!isPrintMode && (
              <div className="flex items-center gap-2 bg-slate-200/40 p-1.5 rounded-2xl border border-slate-300/20">
                <button onClick={handleUndo} disabled={history.length === 0} className={`p-3 rounded-xl transition-all ${history.length > 0 ? 'text-slate-700 hover:bg-white hover:shadow-sm' : 'text-slate-300'}`}><Undo2 size={18} /></button>
                <div className="w-[1px] h-6 bg-slate-300 mx-1" />
                <button onClick={() => setIsLocked(!isLocked)} className={`p-3 rounded-xl transition-all ${isLocked ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-slate-700 hover:bg-white hover:shadow-sm'}`}>{isLocked ? <Lock size={18} /> : <Unlock size={18} />}</button>
              </div>
            )}
          </div>
          <button onClick={() => setIsPrintMode(!isPrintMode)} className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.15em] shadow-xl transition-all hover:scale-105 active:scale-95 ${isPrintMode ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'}`}>
            {isPrintMode ? <><Eye size={18} /> Modo Edição</> : <><Printer size={18} /> Visualização Limpa</>}
          </button>
        </header>

        <div className="flex-1 p-10 pt-6 overflow-hidden flex flex-col">
          <motion.div layout className="bg-white flex-1 rounded-[3.5rem] border border-slate-300/80 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1 flex flex-col custom-scrollbar">
              <table className="w-full border-separate border-spacing-0 flex-1 flex flex-col">
                <thead className="sticky top-0 z-40 bg-slate-900 shadow-2xl">
                  <tr className="flex w-full">
                    <th className="w-60 min-w-[15rem] p-8 text-left sticky left-0 bg-slate-900 z-50 border-r border-white/20">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Colaboradores</span>
                    </th>
                    {daysArray.map((day) => {
                      const date = new Date(year, currentMonth, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      return (
                        <th key={day} className={`flex-1 min-w-[42px] py-6 text-center relative border-r border-white/20 transition-colors ${isWeekend ? 'bg-white/5' : ''}`}>
                          <div className={`text-sm font-black ${isWeekend ? 'text-rose-400' : 'text-slate-200'}`}>{day}</div>
                          <div className={`text-[9px] font-black uppercase tracking-tighter ${isWeekend ? 'text-rose-600/60' : 'text-slate-600'}`}>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][date.getDay()]}</div>
                        </th>
                      );
                    })}
                    <th className="w-16 p-2 flex items-center justify-center bg-slate-900"><BarChart3 size={16} className="text-slate-700" /></th>
                  </tr>
                </thead>
                <tbody className="flex-1 overflow-y-auto divide-y divide-slate-200 custom-scrollbar">
                  {filteredMembers.map((member) => (
                    <tr key={member} className="group flex w-full h-[calc(100%/13.5)] min-h-[64px] hover:bg-blue-50/50 transition-colors">
                      <td className="w-60 min-w-[15rem] px-8 border-r border-slate-300 flex items-center justify-between sticky left-0 bg-white/95 backdrop-blur-md z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                        <span className="text-[13px] font-black text-slate-700 tracking-tight uppercase">{member}</span>
                        {!isPrintMode && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => copyMemberSchedule(member)} className="p-2 hover:bg-blue-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"><ClipboardPaste size={14} className="rotate-180" /></button>
                            {clipboardData && <button onClick={() => pasteMemberSchedule(member)} className="p-2 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors"><ClipboardPaste size={14} /></button>}
                          </div>
                        )}
                      </td>
                      {daysArray.map((day) => {
                        const m = String(currentMonth + 1).padStart(2, '0');
                        const d = String(day).padStart(2, '0');
                        const rawStatus = scheduleData[`${member}-2026-${m}-${d}`];
                        const type = typeof rawStatus === 'object' && rawStatus !== null ? rawStatus.type : (rawStatus || 'Trabalho');
                        const period = typeof rawStatus === 'object' && rawStatus !== null ? rawStatus.period : 'Full';
                        const note = typeof rawStatus === 'object' && rawStatus !== null ? rawStatus.note : null;
                        const isWeekend = new Date(year, currentMonth, day).getDay() % 6 === 0;

                        return (
                          <td key={day} onClick={() => toggleDayStatus(member, day)} className={`flex-1 min-w-[42px] p-2 border-r border-slate-200 cursor-pointer relative group/cell ${isWeekend ? 'bg-slate-50/80' : ''}`}>
                            <motion.div
                              whileHover={!isPrintMode && !isLocked ? { scale: 1.05, y: -1, zIndex: 10 } : {}}
                              className={`h-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300 relative ${type !== 'Trabalho' ? COLORS[type as AbsenceType] : 'bg-transparent border-transparent'} ${period === 'Morning' ? 'w-[65%] mr-auto rounded-xl rounded-r-none' : period === 'Afternoon' ? 'w-[65%] ml-auto rounded-xl rounded-l-none' : 'w-full rounded-xl'}`}
                            >
                              {type !== 'Trabalho' ? ABSENCE_CONFIG[type as AbsenceType].short : ''}
                              {note && (
                                <div className="absolute top-0.5 right-0.5">
                                  <div className="w-0 h-0 border-t-[8px] border-l-[8px] border-t-white/80 border-l-transparent rounded-tr-sm" />
                                </div>
                              )}
                              {note && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-4 bg-slate-900 text-white text-[11px] font-bold rounded-2xl shadow-2xl opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-all z-[100] border border-white/10 backdrop-blur-md">
                                  <div className="flex items-center gap-2 mb-2 text-blue-400 border-b border-white/10 pb-1">
                                    <MessageSquare size={12} />
                                    <span className="uppercase tracking-[0.2em] text-[8px]">Nota de Escala</span>
                                  </div>
                                  {note}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-900" />
                                </div>
                              )}
                            </motion.div>
                          </td>
                        );
                      })}
                      <td className="w-16 border-l border-slate-300 flex items-center justify-center font-black text-[12px] text-slate-600 bg-slate-50/80">{daysArray.reduce((acc, d) => (getStatus(member, d) !== 'Trabalho' ? acc + 1 : acc), 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-xl border-t-4 border-slate-900 shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
                  <tr className="flex w-full h-24">
                    <td className="w-60 min-w-[15rem] p-6 border-r border-slate-300 flex items-center gap-5 bg-slate-50/90 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                      <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-200"><Users size={24} className="text-blue-600" /></div>
                      <div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Equipa em</span>
                         <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Cobertura</span>
                      </div>
                    </td>
                    {dailyAnalysis.map((data, idx) => (
                      <td key={idx} onClick={() => setSelectedDayDetails(data)} className={`flex-1 min-w-[42px] flex items-center justify-center border-r border-slate-300 cursor-pointer hover:bg-white transition-all group ${data.isShort ? 'bg-rose-50/60' : 'text-slate-800'}`}>
                        <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
                           {data.isShort ? <AlertCircle size={16} className="text-rose-500 mb-0.5 animate-pulse" /> : null}
                           <span className={`text-[15px] font-black tracking-tighter ${data.isShort ? 'text-rose-600' : 'text-slate-900'}`}>{data.totalPresent}</span>
                           <div className={`w-4 h-1 rounded-full ${data.isShort ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'}`} />
                        </div>
                      </td>
                    ))}
                    <td className="w-16 bg-slate-50/90 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.05)]"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        </div>

        {!isPrintMode && (
          <div className="px-12 py-8 bg-[#0F172A] border-t border-white/10 relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-4 relative z-10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap mr-6">Filtros de Exibição</span>
              {(Object.keys(ABSENCE_CONFIG) as AbsenceType[]).map((type) => (
                <button key={type} onClick={() => setHighlightFilter(highlightFilter === type ? null : type)} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all ${highlightFilter === type ? COLORS[type] + ' border-white/40 shadow-lg ring-1 ring-white/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                  <div className={`w-3 h-3 rounded-full ${COLORS[type].split(' ')[0]}`} />
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase whitespace-nowrap">{ABSENCE_CONFIG[type].label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid white; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 20px; }
        table { border-collapse: separate !important; }
      `}</style>
    </div>
  );
}