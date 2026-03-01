'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- NOVAS IMPORTAÇÕES FIREBASE ---
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
} from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
  apiKey: 'AIzaSyCY4SbHnB-yEKwk0wfG9yM4WNver0cLF2Y',
  authDomain: 'gestao-calendario-4ddba.firebaseapp.com',
  databaseURL:
    'https://gestao-calendario-4ddba-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'gestao-calendario-4ddba',
  storageBucket: 'gestao-calendario-4ddba.firebasestorage.app',
  messagingSenderId: '307690076999',
  appId: '1:307690076999:web:8b301a8ed9780cf3082a62',
  measurementId: 'G-6KV859V7Z8',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const COLORS: Record<AbsenceType, string> = {
  Trabalho: 'bg-slate-50/30 text-slate-400 border-slate-100/50 hover:bg-white hover:shadow-sm',
  Folga: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100/20',
  Férias: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100/20',
  'Gozo Feriado': 'bg-gradient-to-br from-rose-50 to-red-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-100/20',
  'Visita Guiada': 'bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 border-indigo-200 shadow-sm shadow-indigo-100/20',
  Feira: 'bg-gradient-to-br from-orange-50 to-yellow-50 text-orange-600 border-orange-200 shadow-sm shadow-orange-100/20',
  Formação: 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 border-blue-200 shadow-sm shadow-blue-100/20',
  'Serviço Externo': 'bg-slate-100 text-slate-600 border-slate-200 shadow-inner',
  'Baixa Médica': 'bg-gradient-to-br from-red-50 to-rose-50 text-red-600 border-red-200 shadow-sm shadow-red-100/20',
  'Trabalhador-Estudante': 'bg-gradient-to-br from-lime-50 to-green-50 text-lime-600 border-lime-200 shadow-sm shadow-lime-100/20',
  'Consulta Médica': 'bg-gradient-to-br from-cyan-50 to-sky-50 text-cyan-600 border-cyan-200 shadow-sm shadow-cyan-100/20',
  'Banco de Horas': 'bg-gradient-to-br from-yellow-50 to-amber-100 text-amber-700 border-yellow-300 shadow-sm shadow-yellow-100/20',
  'Tolerância de Ponto': 'bg-gradient-to-br from-fuchsia-50 to-pink-50 text-fuchsia-600 border-fuchsia-200 shadow-sm shadow-fuchsia-100/20',
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

  // Estados do Modal de Notas (Declarados apenas uma vez aqui no topo)
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
    setHistory((prev) => [scheduleData, ...prev.slice(0, 19)]);

    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const key = `${member}-2026-${m}-${d}`;
    const newDocs = { ...scheduleData };
    const current = newDocs[key];

    const typesWithNotes: AbsenceType[] = ['Banco de Horas', 'Tolerância de Ponto', 'Gozo Feriado', 'Visita Guiada', 'Feira', 'Formação', 'Serviço Externo'];

    if (selectedType === 'Consulta Médica' || selectedType === 'Trabalhador-Estudante') {
      if (!current || (typeof current === 'object' && current.type !== selectedType)) {
        newDocs[key] = { type: selectedType, period: 'Morning' };
      } else if (typeof current === 'object' && current.period === 'Morning') {
        newDocs[key] = { type: selectedType, period: 'Afternoon' };
      } else if (typeof current === 'object' && current.period === 'Afternoon') {
        newDocs[key] = { type: selectedType, period: 'Full' };
      } else { delete newDocs[key]; }
    } 
    else if (typesWithNotes.includes(selectedType)) {
      const currentType = typeof current === 'object' ? current.type : current;
      if (current && currentType === selectedType) { delete newDocs[key]; } 
      else {
        setTempNote(typeof current === 'object' ? current.note || '' : '');
        setNoteModal({ show: true, member, day, type: selectedType });
        return;
      }
    } 
    else {
      const currentType = typeof current === 'object' ? current.type : current;
      if (current && currentType === selectedType) { delete newDocs[key]; } 
      else { newDocs[key] = selectedType; }
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
      return { day, totalPresent: currentTotalPresent, isShort: currentTotalPresent < 3, groupsByTime };
    });
  }, [daysArray, scheduleData]);

  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* MODAL PARA NOTAS / MOTIVOS */}
      <AnimatePresence>
        {noteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10">
              <h3 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">Motivo / Detalhe</h3>
              <p className="text-slate-500 text-sm mb-6 font-bold">{ABSENCE_CONFIG[noteModal.type].label} para {noteModal.member}</p>
              <textarea
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-6"
                
                rows={3}
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={() => setNoteModal(null)} className="flex-1 py-4 rounded-xl text-slate-500 font-black uppercase text-xs hover:bg-slate-100 transition-all">Cancelar</button>
                <button
                  onClick={() => {
                    const m = String(currentMonth + 1).padStart(2, '0');
                    const d = String(noteModal.day).padStart(2, '0');
                    const key = `${noteModal.member}-2026-${m}-${d}`;
                    const newData = { ...scheduleData, [key]: { type: noteModal.type, period: 'Full', note: tempNote } };
                    setScheduleData(newData);
                    saveToFirebase(newData);
                    setNoteModal(null);
                  }}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-slate-800 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
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

      {/* DETALHES MODAL */}
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

      {/* SIDEBAR */}
      {!isPrintMode && (
        <aside className="w-[340px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">
          <div className="p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent">
            <motion.img initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} src="https://i.imgur.com/REOtXYt.png" alt="Logo" className="h-28 mb-8 object-contain drop-shadow-sm" />
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center"><ShieldCheck size={12} className="text-white" /></div>
              <h1 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.25em]">Escalas 2026</h1>
            </div>
            <p className="text-xl font-black text-slate-900 leading-tight tracking-tight">Divisão de Economia e Turismo</p>
          </div>
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"><Search size={16} /></div>
              <input type="text" placeholder="Procurar colaborador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm" />
            </div>
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5 mb-6"><MousePointer2 size={14} className="text-blue-500" /> Pincel de Edição</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {(Object.keys(ABSENCE_CONFIG) as AbsenceType[]).map((type) => (
                  <motion.button key={type} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedType(type)} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-300 ${selectedType === type ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100/80 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${COLORS[type].split(' ')[0]} border border-white/20`} />
                      <span className="text-[12px] font-bold tracking-tight">{ABSENCE_CONFIG[type].label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
            <div className="p-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <p className="text-sm font-bold leading-relaxed mb-4 relative z-10">Selecione uma categoria acima e &quot;pinte&quot; o calendário com um clique.</p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-full relative z-10"><TrendingUp size={12} /> Sugestão Ativa</div>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <header className="px-12 py-8 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <div className="bg-slate-100/80 p-1.5 rounded-[1.5rem] flex items-center shadow-inner border border-slate-200/50">
              <button onClick={() => setCurrentMonth((p) => Math.max(0, p - 1))} className="p-3 hover:bg-white rounded-xl text-slate-600"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-black text-slate-800 w-56 text-center uppercase tracking-tighter">{MONTHS[currentMonth]} <span className="text-blue-600">{year}</span></h2>
              <button onClick={() => setCurrentMonth((p) => Math.min(11, p + 1))} className="p-3 hover:bg-white rounded-xl text-slate-600"><ChevronRight size={20} /></button>
            </div>
            {!isPrintMode && (
              <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/30">
                <button onClick={handleUndo} disabled={history.length === 0} className={`p-3 rounded-xl ${history.length > 0 ? 'text-slate-700 hover:bg-white' : 'text-slate-300'}`}><Undo2 size={18} /></button>
                <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                <button onClick={() => setIsLocked(!isLocked)} className={`p-3 rounded-xl ${isLocked ? 'bg-amber-100 text-amber-600' : 'text-slate-700 hover:bg-white'}`}>{isLocked ? <Lock size={18} /> : <Unlock size={18} />}</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPrintMode(!isPrintMode)} className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.1em] shadow-lg transition-all ${isPrintMode ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'}`}>
              {isPrintMode ? <><Eye size={18} /> Modo Edição</> : <><Printer size={18} /> Visualização Limpa</>}
            </button>
          </div>
        </header>

        <div className="flex-1 p-10 pt-6 overflow-hidden flex flex-col">
          <motion.div layout className="bg-white flex-1 rounded-[3.5rem] border border-slate-200/60 shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1 flex flex-col custom-scrollbar">
              <table className="w-full border-separate border-spacing-0 flex-1 flex flex-col">
                <thead className="sticky top-0 z-40 bg-slate-900">
                  <tr className="flex w-full">
                    <th className="w-60 min-w-[15rem] p-7 text-left"><span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Colaboradores</span></th>
                    {daysArray.map((day) => {
                      const date = new Date(year, currentMonth, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const isToday = isThisMonth && day === currentDayNumber;
                      return (
                        <th key={day} className={`flex-1 min-w-[36px] py-5 text-center transition-colors relative ${isWeekend ? 'bg-slate-800/40' : ''}`}>
                          <div className={`text-sm font-black ${isToday ? 'text-blue-400' : 'text-slate-200'}`}>{day}</div>
                          <div className={`text-[9px] font-bold uppercase ${isToday ? 'text-blue-500' : 'text-slate-600'}`}>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][date.getDay()]}</div>
                          {isToday && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>}
                        </th>
                      );
                    })}
                    <th className="w-16 p-2 flex items-center justify-center bg-slate-900"><BarChart3 size={16} className="text-slate-600" /></th>
                  </tr>
                </thead>
                <tbody className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {filteredMembers.map((member) => (
                    <tr key={member} className="group flex w-full h-[calc(100%/13.5)] min-h-[48px] hover:bg-slate-50/60">
                      <td className="w-60 min-w-[15rem] px-7 border-r border-slate-50 flex items-center justify-between sticky left-0 bg-white z-10 group-hover:bg-slate-50/50">
                        <span className="text-[12px] font-bold text-slate-700 tracking-tight">{member}</span>
                        {!isPrintMode && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button onClick={() => copyMemberSchedule(member)} className="p-2 hover:bg-blue-50 rounded-xl text-slate-300 hover:text-blue-600 transition-colors"><ClipboardPaste size={14} className="rotate-180" /></button>
                            {clipboardData && <button onClick={() => pasteMemberSchedule(member)} className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-600 transition-colors"><ClipboardPaste size={14} /></button>}
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
                        const isToday = isThisMonth && day === currentDayNumber;
                        const isHighlighted = !highlightFilter || highlightFilter === type;

                        return (
                          <td key={day} onClick={() => !isPrintMode && toggleDayStatus(member, day)} className={`flex-1 min-w-[36px] p-[3px] border-r border-slate-50 cursor-pointer relative ${isToday ? 'bg-blue-50/20' : ''}`}>
                            <motion.div
                              whileHover={!isPrintMode && !isLocked ? { scale: 1.05, zIndex: 10 } : {}}
                              className={`h-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 relative overflow-hidden ${type !== 'Trabalho' ? COLORS[type as AbsenceType] : 'bg-transparent border-transparent'} ${!isHighlighted ? 'opacity-5 scale-[0.85] grayscale' : 'opacity-100'} ${period === 'Morning' ? 'w-[65%] mr-auto rounded-l-xl rounded-r-none' : period === 'Afternoon' ? 'w-[65%] ml-auto rounded-r-xl rounded-l-none' : 'w-full rounded-xl'}`}
                              title={note ? `Nota: ${note}` : ABSENCE_CONFIG[type as AbsenceType]?.label}
                            >
                              {type !== 'Trabalho' ? ABSENCE_CONFIG[type as AbsenceType].short : ''}
                              {note && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-current opacity-30 rounded-bl-full" />}
                            </motion.div>
                          </td>
                        );
                      })}
                      <td className="w-16 border-l border-slate-100 flex items-center justify-center font-black text-[11px] text-slate-400">{daysArray.reduce((acc, d) => (getStatus(member, d) !== 'Trabalho' ? acc + 1 : acc), 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 z-40 bg-slate-50/90 backdrop-blur-md border-t-2 border-slate-200">
                  <tr className="flex w-full h-16">
                    <td className="w-60 min-w-[15rem] p-5 bg-slate-100 border-r border-slate-200 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200/50"><Users size={18} className="text-blue-600" /></div>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Cobertura</span>
                    </td>
                    {dailyAnalysis.map((data, idx) => (
                      <td key={idx} onClick={() => setSelectedDayDetails(data)} className={`flex-1 min-w-[36px] flex flex-col items-center justify-center border-r border-slate-100 cursor-pointer hover:bg-white transition-all ${data.isShort ? 'bg-rose-50/50 text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                        <span className="text-sm font-black">{data.totalPresent}</span>
                      </td>
                    ))}
                    <td className="w-16 bg-slate-100"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        </div>

        {/* FILTROS FOOTER */}
        {!isPrintMode && (
          <div className="px-12 py-6 bg-white border-t border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap mr-2">Filtros:</span>
              <div className="flex gap-2">
                {(Object.keys(ABSENCE_CONFIG) as AbsenceType[]).map((type) => {
                  const isActive = highlightFilter === type;
                  return (
                    <button key={type} onClick={() => setHighlightFilter(isActive ? null : type)} className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all whitespace-nowrap ${isActive ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <div className={`w-2 h-2 rounded-full ${COLORS[type].split(' ')[0]}`} />
                      <span className="text-[11px] font-bold tracking-tight">{ABSENCE_CONFIG[type].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}