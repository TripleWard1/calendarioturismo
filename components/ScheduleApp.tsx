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
  Pin,
  Briefcase,
  GripHorizontal
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

const COLORS: Record<string, string> = {
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
  'Agenda / Reunião': 'bg-gradient-to-br from-slate-600 to-indigo-900 text-white border-white/20 shadow-lg ring-1 ring-white/10',
  'Evento Global': 'bg-gradient-to-br from-purple-500 to-indigo-700 text-white border-white/20 shadow-xl ring-2 ring-white/20'
};

const MEMBER_HOURS: Record<string, { am: string; pm: string }> = {
  'Luís Ferreira': { am: '09:00-13:00', pm: '14:00-18:00' },
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

const UPDATED_TEAM_MEMBERS = ['Luís Ferreira', ...TEAM_MEMBERS];

export default function ScheduleApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [year] = useState(2026);
  const [scheduleData, setScheduleData] = useState<Record<string, any>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Folga');
  const [highlightFilter, setHighlightFilter] = useState<string | null>(null);
  const [clipboardData, setClipboardData] = useState<Record<string, any> | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<any | null>(null);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [noteModal, setNoteModal] = useState<{ show: boolean; member: string; day: number; type: string; existingData?: any; editIndex?: number } | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [tempTime, setTempTime] = useState('09:00-13:00');
  const [isFullDay, setIsFullDay] = useState(false); // NOVO
  const [draggedItem, setDraggedItem] = useState<{ member: string; day: number; data: any } | null>(null);
  const [calendarView, setCalendarView] = useState<'ALL' | 'DYNAMICS' | 'LUIS' | 'TEAM'>('ALL');
  const [expandedLuisDay, setExpandedLuisDay] = useState<number | null>(null);
const [expandedGlobalDay, setExpandedGlobalDay] = useState<number | null>(null);
    // ==========================
  // REVAMP (apenas Luís + GLOBAL) — colaboradores ficam iguais
  // ==========================
  const [hoverLuisDay, setHoverLuisDay] = useState<number | null>(null);
  const [hoverGlobalDay, setHoverGlobalDay] = useState<number | null>(null);

  // Pequeno "hover popover" com info completa (native-like dentro da app)
  const [hoverCard, setHoverCard] = useState<null | {
    kind: 'LUIS' | 'GLOBAL';
    day: number;
    anchor: { x: number; y: number };
    title: string;
    time?: string;
    note?: string;
  }>(null);
  

  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const getStatus = (member: string, day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const res = scheduleData[`${member}-2026-${m}-${d}`];
    // Se for array (Luís/Global), pegamos o primeiro para a estatística ou ignoramos se vazio
    if (Array.isArray(res)) return res[0]?.type || 'Trabalho';
    return res?.type || res || 'Trabalho';
  };

  const toggleDayStatus = (member: string, day: number) => {
    if (isLocked) { showToast('Escala bloqueada!', 'error'); return; }
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const key = `${member}-2026-${m}-${d}`;
    const current = scheduleData[key];
    
    // Normalização para checar o tipo atual
    const currentType = Array.isArray(current) 
      ? (current.length > 0 ? current[0].type : 'Trabalho')
      : (typeof current === 'object' && current !== null ? current.type : (current || 'Trabalho'));

    setHistory((prev) => [scheduleData, ...prev.slice(0, 19)]);
    const newDocs = { ...scheduleData };
    
    const typesWithNotes = ['Banco de Horas', 'Tolerância de Ponto', 'Gozo Feriado', 'Visita Guiada', 'Feira', 'Formação', 'Serviço Externo', 'Agenda / Reunião', 'Evento Global'];

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
      const currObj = Array.isArray(current) ? (current[0] || null) : current;
      const existingNote = (currObj && typeof currObj === 'object') ? (currObj.note || '') : '';
      const existingTime = (currObj && typeof currObj === 'object') ? (currObj.time || '09:00-13:00') : '09:00-13:00';
      const existingFullDay = existingTime === 'Dia Todo';
    
      setTempNote(existingNote || '');
      setTempTime(existingTime && existingTime !== 'Dia Todo' ? existingTime : '09:00-13:00');
      setIsFullDay(existingFullDay);
    
      // ✅ aqui abre o modal para adicionar (não tem idx)
      setNoteModal({ show: true, member, day, type: selectedType, existingData: current });
      return;
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

  const onDragStart = (member: string, day: number, data: any) => {
    if (isLocked || data === 'Trabalho') return;
    setDraggedItem({ member, day, data });
  };

  const onDrop = (targetMember: string, targetDay: number) => {
    if (!draggedItem || isLocked) return;
    const m = String(currentMonth + 1).padStart(2, '0');
    const targetKey = `${targetMember}-2026-${m}-${String(targetDay).padStart(2, '0')}`;
    
    const newDocs = { ...scheduleData, [targetKey]: draggedItem.data };
    setScheduleData(newDocs);
    saveToFirebase(newDocs);
    setDraggedItem(null);
    showToast('Copiado com sucesso!');
  };

  const dailyAnalysis = useMemo(() => {
    return daysArray.map((day) => {
      const date = new Date(year, currentMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const validTeam = UPDATED_TEAM_MEMBERS.filter(m => m !== 'Luís Ferreira');
      let currentTotalPresent = validTeam.length; 
      
      validTeam.forEach((m) => {
        const status = getStatus(m, day);
        const type = status;
        
        if (type !== 'Trabalho' && type !== 'Agenda / Reunião') {
            const mStr = String(currentMonth + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            const raw = scheduleData[`${m}-2026-${mStr}-${dStr}`];
            if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
                if (raw.period === 'Morning' || raw.period === 'Afternoon') currentTotalPresent -= 0.5;
                else currentTotalPresent -= 1;
            } else currentTotalPresent -= 1;
        }
      });

      const staffFullPresent = validTeam.filter((m) => {
        const status = getStatus(m, day);
        if (status === 'Trabalho' || status === 'Agenda / Reunião') return true;
        return false;
      });

      const groupsByTime: Record<string, string[]> = { '09:00': [], '09:15': [], '09:30': [] };
      staffFullPresent.forEach((m) => {
        const start = MEMBER_HOURS[m]?.am.split('-')[0];
        if (groupsByTime[start]) groupsByTime[start].push(m);
      });

      const hasShortShift = isWeekend ? false : Object.values(groupsByTime).some(members => members.length < 2);
      const isShort = isWeekend ? false : currentTotalPresent < 3 || hasShortShift;

      return { day, totalPresent: currentTotalPresent, isShort, groupsByTime };
    });
  }, [daysArray, scheduleData, currentMonth]);

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

    // ==========================
  // HELPERS — (Luís + GLOBAL apenas)
  // ==========================
  const getKey = (member: string, day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${member}-2026-${m}-${d}`;
  };

  const toArray = (raw: any) => {
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  };

  const getEntriesFor = (member: string, day: number) => {
    const raw = scheduleData[getKey(member, day)];
    return toArray(raw).filter(Boolean);
  };

  const getLuisAgenda = (day: number) => {
    const entries = getEntriesFor('Luís Ferreira', day);
    return entries
      .map((e: any, idx: number) => ({ e, idx })) // idx ORIGINAL no array
      .filter(({ e }) => {
        const t = (typeof e === 'object' && e !== null) ? e.type : e;
        return t === 'Agenda / Reunião';
      });
  };

  const getGlobalEvents = (day: number) => {
    const entries = getEntriesFor('GLOBAL', day);
    return entries
      .map((e: any, idx: number) => ({ e, idx }))
      .filter(({ e }) => {
        const t = (typeof e === 'object' && e !== null) ? e.type : e;
        return t === 'Evento Global';
      });
  };

  const openLuisNew = (day: number) => {
    // abre modal para criar Agenda/Reunião sem usar pincel
    setTempNote('');
    setIsFullDay(false);
    setTempTime('09:00-13:00');
    setNoteModal({ show: true, member: 'Luís Ferreira', day, type: 'Agenda / Reunião' });
  };

  const openGlobalNew = (day: number) => {
    setTempNote('');
    setIsFullDay(false);
    setTempTime('09:00-13:00');
    setNoteModal({ show: true, member: 'GLOBAL', day, type: 'Evento Global' });
  };

  const removeIndexed = (member: 'Luís Ferreira' | 'GLOBAL', day: number, idx: number) => {
    if (isLocked) { showToast('Escala bloqueada!', 'error'); return; }
  
    // ✅ fecha hover SEMPRE (porque o onMouseLeave pode não acontecer ao remover)
    setHoverCard(null);
  
    const key = getKey(member, day);
    const current = scheduleData[key];
  
    setHistory((prev) => [scheduleData, ...prev.slice(0, 19)]);
  
    const newDocs = { ...scheduleData };
  
    if (Array.isArray(current)) {
      const updated = current.filter((_: any, i: number) => i !== idx);
      if (updated.length === 0) delete newDocs[key];
      else newDocs[key] = updated;
    } else {
      delete newDocs[key];
    }
  
    setScheduleData(newDocs);
    saveToFirebase(newDocs);
    showToast('Removido!');
  };

  const showHoverCard = (
    e: React.MouseEvent,
    payload: { kind: 'LUIS' | 'GLOBAL'; day: number; title: string; time?: string; note?: string }
  ) => {
    // posição "nativa" (perto do cursor)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoverCard({
      ...payload,
      anchor: { x: rect.right + 8, y: rect.top }
    });
  };

  const hideHoverCard = () => setHoverCard(null);

  useEffect(() => {
    if (!hoverCard) return;
  
    const close = () => setHoverCard(null);
  
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
  
    // scroll em qualquer container. (capture=true)
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('pointerdown', close, true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', close);
  
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('pointerdown', close, true);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', close);
    };
  }, [hoverCard]);

  const filteredMembersList = useMemo(() => {
    return UPDATED_TEAM_MEMBERS.filter((m) =>
      m.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex h-screen bg-[#F0F4F8] text-slate-900 font-sans overflow-hidden">
      <AnimatePresence>
        {noteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
              <h3 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">Registar {noteModal.type}</h3>
              <p className="text-slate-500 text-sm mb-6 font-bold">{noteModal.member} • Dia {noteModal.day}</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500">Dia Inteiro</span>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    checked={isFullDay}
                    onChange={(e) => setIsFullDay(e.target.checked)}
                  />
                </div>
                {!isFullDay && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Horário / Período</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold mt-1" value={tempTime} onChange={(e) => setTempTime(e.target.value)} placeholder="Ex: 09:00-13:00" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Observações</label>
                  <textarea autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-inner mt-1" rows={3} placeholder="Escreva o detalhe aqui..." value={tempNote} onChange={(e) => setTempNote(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setNoteModal(null)} className="flex-1 py-4 rounded-xl text-slate-500 font-black uppercase text-xs hover:bg-slate-100 transition-all">Fechar</button>
                <button onClick={() => {
                  const m = String(currentMonth + 1).padStart(2, '0');
                  const d = String(noteModal.day).padStart(2, '0');
                  const key = `${noteModal.member}-2026-${m}-${d}`;
                  
                  const newEntry = { 
                    type: noteModal.type, 
                    period: 'Full', 
                    note: tempNote, 
                    time: isFullDay ? 'Dia Todo' : tempTime 
                  };

                  let finalData;
if (noteModal.member === 'Luís Ferreira' || noteModal.member === 'GLOBAL') {
  const existing = Array.isArray(scheduleData[key]) ? scheduleData[key] : (scheduleData[key] ? [scheduleData[key]] : []);

  
  if (typeof noteModal.editIndex === 'number') {
    const updated = [...existing];
    updated[noteModal.editIndex] = newEntry;
    finalData = updated;
  } else {
    finalData = [...existing, newEntry];
  }
} else {
  finalData = newEntry;
}

                  const newData = { ...scheduleData, [key]: finalData };
                  setScheduleData(newData);
                  saveToFirebase(newData);
                  setNoteModal(null);
                  setTempNote('');
                  setTempTime('09:00-13:00');
                  setIsFullDay(false);
                }} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-slate-800 transition-all">Salvar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ y: -100, x: '-50%', opacity: 0 }} animate={{ y: 12, x: '-50%', opacity: 1 }} exit={{ y: -100, x: '-50%', opacity: 0 }} className="fixed left-1/2 z-[2000]">
            <div className={`flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl border backdrop-blur-xl ${toast.type === 'success' ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-rose-600/90 border-rose-500 text-white'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} />}
              <span className="text-xs font-bold tracking-tight">{toast.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDayDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-3xl overflow-hidden border border-slate-100">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white flex justify-between items-start relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-1">Dia {selectedDayDetails.day}</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">{MONTHS[currentMonth]} 2026</p>
                </div>
                <button onClick={() => setSelectedDayDetails(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {Object.entries(selectedDayDetails.groupsByTime).map(([time, members]: any) => (
                  <div key={time} className="group bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Clock size={16} /></div>
                        <span className="text-sm font-black text-slate-800 tracking-tight">Entrada {time}</span>
                      </div>
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${members.length < 2 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{members.length} Presentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {members.length > 0 ? members.map((n: string) => <span key={n} className="bg-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-slate-100 text-slate-700">{n}</span>) : <span className="text-slate-400 text-[10px] italic ml-1">Nenhum colaborador alocado.</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hoverCard && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="fixed z-[5000]"
            style={{ left: hoverCard.anchor.x, top: hoverCard.anchor.y }}
          >
            <div className="w-[340px] rounded-2xl border border-white/15 bg-slate-900/95 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4">
              <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-white/10">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
                  {hoverCard.kind === 'LUIS' ? 'Agenda Luís' : 'Dinâmicas'}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Dia {hoverCard.day}
                </div>
              </div>

              {hoverCard.time && (
                <div className="text-[12px] font-black text-slate-100 mb-2 whitespace-nowrap">
                  {hoverCard.time}
                </div>
              )}

              <div className="text-[12px] font-bold leading-relaxed break-words whitespace-normal">
                {hoverCard.note || (hoverCard as any).title}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPrintMode && (
        <aside className="w-[300px] bg-[#0F172A] border-r border-white/5 flex flex-col z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.6)] shrink-0">
          <div className="p-8 border-b border-white/5 bg-slate-900/50 relative overflow-hidden">
             <div className="bg-white/5 p-4 rounded-[2rem] mb-6 flex justify-center backdrop-blur-md border border-white/10 shadow-2xl relative">
                <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src="https://i.imgur.com/y6gqWGw.png" alt="Logo" className="h-20 w-auto object-contain drop-shadow-2xl" />
            </div>
            <div className="flex items-center gap-2 mb-1.5 relative">
              <div className="w-4 h-4 bg-blue-500 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]"><ShieldCheck size={10} className="text-white" /></div>
              <h1 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Escalas 2026</h1>
            </div>
            <p className="text-lg font-black text-white leading-tight tracking-tight relative uppercase">Divisão de Economia e Turismo</p>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar-dark">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors"><Search size={14} /></div>
              <input type="text" placeholder="Procurar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all hover:bg-white/10" />
            </div>
            <section>
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2 mb-4"><MousePointer2 size={12} className="text-blue-500" /> Pincel</h3>
              <div className="grid grid-cols-1 gap-2.5">
                <button onClick={() => setSelectedType('Evento Global')} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedType === 'Evento Global' ? COLORS['Evento Global'] + ' shadow-xl' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                   <div className="flex items-center gap-3"><Pin size={12} className="text-purple-400" /><span className="text-[9px] font-black uppercase tracking-widest">📌 Evento Global</span></div>
                </button>
                <button onClick={() => setSelectedType('Agenda / Reunião')} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedType === 'Agenda / Reunião' ? COLORS['Agenda / Reunião'] + ' shadow-xl' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                   <div className="flex items-center gap-3"><Briefcase size={12} className="text-indigo-400" /><span className="text-[9px] font-black uppercase tracking-widest">💼 Agenda / Reunião</span></div>
                </button>
                <div className="h-px bg-white/10 my-1" />
                {Object.keys(ABSENCE_CONFIG).map((type) => (
                  <motion.button key={type} whileHover={{ x: 4, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedType(type)} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${selectedType === type ? COLORS[type] + ' border-white/30 shadow-xl' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-3 h-3 rounded-full border border-white/30 ${COLORS[type].split(' ')[0]}`} />
                      <span className="text-[9px] font-black tracking-widest uppercase">{ABSENCE_CONFIG[type as AbsenceType].label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9]">
        <header className="px-10 py-4 bg-white/80 backdrop-blur-2xl border-b border-slate-200 flex justify-between items-center sticky top-0 z-50 shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <div className="bg-slate-200/50 p-1 rounded-2xl flex items-center border border-slate-300/30">
              <button onClick={() => setCurrentMonth((p) => Math.max(0, p - 1))} className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all"><ChevronLeft size={18} /></button>
              <h2 className="text-base font-black text-slate-800 w-44 text-center uppercase tracking-tighter">{MONTHS[currentMonth]} <span className="text-blue-600">{year}</span></h2>
              <button onClick={() => setCurrentMonth((p) => Math.min(11, p + 1))} className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all"><ChevronRight size={18} /></button>
            </div>
            {!isPrintMode && (
              <div className="flex items-center gap-1.5 bg-slate-200/40 p-1 rounded-xl border border-slate-300/20">
                <button onClick={handleUndo} disabled={history.length === 0} className={`p-2 rounded-lg transition-all ${history.length > 0 ? 'text-slate-700 hover:bg-white shadow-sm' : 'text-slate-300'}`}><Undo2 size={16} /></button>
                <div className="w-[1px] h-5 bg-slate-300 mx-0.5" />
                <button onClick={() => setIsLocked(!isLocked)} className={`p-2 rounded-lg transition-all ${isLocked ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-slate-700 hover:bg-white shadow-sm'}`}>{isLocked ? <Lock size={16} /> : <Unlock size={16} />}</button>
              </div>
            )}
          </div>
          <button onClick={() => setIsPrintMode(!isPrintMode)} className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl transition-all hover:scale-105 active:scale-95 ${isPrintMode ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'}`}>
            {isPrintMode ? <><Eye size={16} /> Edição</> : <><Printer size={16} /> Visualização</>}
          </button>
        </header>

        {!isPrintMode && (
  <div className="flex items-center gap-1.5 bg-slate-200/40 p-1 rounded-2xl border border-slate-300/20">
    <button
      onClick={() => setCalendarView('ALL')}
      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        calendarView === 'ALL' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-white'
      }`}
    >
      Tudo
    </button>

    <button
      onClick={() => setCalendarView('DYNAMICS')}
      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        calendarView === 'DYNAMICS' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-white'
      }`}
    >
      Dinâmicas
    </button>

    <button
      onClick={() => setCalendarView('LUIS')}
      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        calendarView === 'LUIS' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-white'
      }`}
    >
      Luís
    </button>

    <button
      onClick={() => setCalendarView('TEAM')}
      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        calendarView === 'TEAM' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-white'
      }`}
    >
      Colaboradores
    </button>
  </div>
)}

        <div className="flex-1 p-6 pt-4 overflow-hidden flex flex-col">
          <motion.div layout className="bg-white flex-1 rounded-[2.5rem] border border-slate-300/80 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] overflow-hidden flex flex-col relative">
          <div className="overflow-auto flex-1 custom-scrollbar">
  <table className="w-max min-w-max border-separate border-spacing-0 flex flex-col">
                <thead className="sticky top-0 z-[100] bg-slate-900 shadow-xl shrink-0">
                  <tr className="flex w-full">
                    <th className="w-52 min-w-[13rem] p-5 text-left sticky left-0 bg-slate-900 z-[110] border-r border-white/10">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Membros</span>
                    </th>
                    {daysArray.map((day) => {
                      const date = new Date(year, currentMonth, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      return (
                        <th key={day} className={`flex-1 min-w-[100px] py-4 text-center relative border-r border-white/10 transition-colors ${isWeekend ? 'bg-white/5' : ''}`}>
                          <div className={`text-xs font-black ${isWeekend ? 'text-rose-400' : 'text-slate-200'}`}>{day}</div>
                          <div className={`text-[8px] font-black uppercase tracking-tighter ${isWeekend ? 'text-rose-600/60' : 'text-slate-600'}`}>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][date.getDay()]}</div>
                        </th>
                      );
                    })}
                    <th className="w-12 p-2 flex items-center justify-center bg-slate-900"><BarChart3 size={14} className="text-slate-700" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 z-10">
                
                {calendarView !== 'LUIS' && calendarView !== 'TEAM' && (
  <>
    {/* LINHA DE DINÂMICAS / EVENTO GLOBAL (com expand/collapse como o Luís) */}
    <tr className="flex w-full min-h-[44px] bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-[90]">
      <td className="w-52 min-w-[13rem] px-5 border-r border-slate-300 flex items-center sticky left-0 bg-slate-100 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <Pin size={12} className="text-purple-600" />
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">📌 Dinâmicas</span>
        </div>
      </td>

      {daysArray.map((day) => {
        const m = String(currentMonth + 1).padStart(2, '0');
        const key = `GLOBAL-2026-${m}-${String(day).padStart(2, '0')}`;
        const status = scheduleData[key];
        const entries = Array.isArray(status) ? status : (status ? [status] : []);

        const isExpanded = expandedGlobalDay === day;
        const visibleList = isExpanded ? entries : entries.slice(0, 2);

        return (
          <td
            key={day}
            onMouseEnter={() => setHoverGlobalDay(day)}
            onMouseLeave={() => setHoverGlobalDay((p) => (p === day ? null : p))}
            onClick={() => toggleDayStatus('GLOBAL', day)}
            className="flex-1 min-w-[100px] p-1 border-r border-slate-200 cursor-pointer hover:bg-purple-50 transition-all relative group/cell overflow-visible align-top"
          >
            {!isPrintMode && hoverGlobalDay === day && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openGlobalNew(day);
                }}
                className="absolute top-1 right-1 z-20 px-2 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-black shadow-lg hover:bg-purple-500"
                title="Adicionar Evento Global"
              >
                +
              </button>
            )}

            <div className="p-1.5 space-y-1">
              {visibleList.map((ent: any, idx: number) => {
                const time =
                  ent?.time && ent.time !== 'Dia Todo'
                    ? ent.time
                    : ent?.time === 'Dia Todo'
                      ? 'Dia Todo'
                      : '';

                const title = ent?.note || 'Sem descrição';

                return (
                  <div
                    key={idx}
                    className="gcal-block gcal-global group/item"
                    onMouseEnter={(e) =>
                      showHoverCard(e, { kind: 'GLOBAL', day, title: 'Evento Global', time, note: title })
                    }
                    onMouseLeave={hideHoverCard}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTempNote(ent?.note || '');
                      setIsFullDay(ent?.time === 'Dia Todo');
                      setTempTime(ent?.time && ent.time !== 'Dia Todo' ? ent.time : '09:00-13:00');
                      setNoteModal({
                        show: true,
                        member: 'GLOBAL',
                        day,
                        type: 'Evento Global',
                        existingData: ent,
                        editIndex: idx
                      });
                    }}
                  >
                    <div className="gcal-block-text">
                      {time ? <div className="gcal-block-time">{time}</div> : null}
                      <div className="gcal-block-title">{title}</div>
                    </div>

                    <button
                      className="gcal-x opacity-0 group-hover/item:opacity-100"
                      title="Remover"
                      onClick={(e) => {
                        e.stopPropagation();
                        hideHoverCard();              // ✅ fecha já
                        removeIndexed('GLOBAL', day, idx);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}

              {entries.length > 2 && !isExpanded && (
                <button
                  className="gcal-more"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedGlobalDay(day);
                  }}
                >
                  +{entries.length - 2} mais
                </button>
              )}

              {isExpanded && entries.length > 2 && (
                <button
                  className="gcal-more"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedGlobalDay(null);
                  }}
                >
                  Mostrar menos
                </button>
              )}
            </div>
          </td>
        );
      })}

      <td className="w-12 bg-slate-100 border-l border-slate-300"></td>
    </tr>
  </>
)}
                  {filteredMembersList
  .filter((m) => {
    if (calendarView === 'LUIS') return m === 'Luís Ferreira';
    if (calendarView === 'TEAM') return m !== 'Luís Ferreira';
    return true; // ALL e DYNAMICS
  })
  .map((member, mIdx) => (
                   <tr
                   key={member}
                   className={`group flex w-full ${
                    member === 'Luís Ferreira'
                      ? (expandedLuisDay ? 'h-auto min-h-[130px]' : 'h-[130px]')
                      : 'h-[48px]'
                  } hover:bg-blue-50/50 transition-colors ${member === 'Luís Ferreira' ? 'bg-indigo-50/30' : ''}`}
                 >
                   <td className="w-52 min-w-[13rem] px-5 border-r border-slate-300 flex items-center justify-between sticky left-0 bg-white/95 backdrop-blur-md z-30 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                     <div className="flex flex-col">
                       <span className={`text-[11px] font-black tracking-tight uppercase truncate max-w-[110px] ${member === 'Luís Ferreira' ? 'text-indigo-700' : 'text-slate-700'}`}>
                         {member}
                       </span>
                       {member === 'Luís Ferreira' && (
                         <span className="text-[7px] font-black text-indigo-400 tracking-[0.2em] uppercase">
                           Chefe de Divisão
                         </span>
                       )}
                     </div>
                 
                     {!isPrintMode && (
                       <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all scale-90">
                         <button
                           onClick={(e) => { e.stopPropagation(); copyMemberSchedule(member); }}
                           className="p-1.5 hover:bg-blue-100 rounded-lg text-slate-400 hover:text-blue-600"
                         >
                           <ClipboardPaste size={12} className="rotate-180" />
                         </button>
                       </div>
                     )}
                   </td>
                 
                   {daysArray.map((day) => {
                     const isWeekend = new Date(year, currentMonth, day).getDay() % 6 === 0;
                 
                     // ==========================
                     // REVAMP VISUAL (só Luís)
                     // ==========================
                     if (member === 'Luís Ferreira') {
                      const luisList = getLuisAgenda(day);
                    
                      // ✅ EXPANDIR / COLAPSAR (mostra 2 ou mostra tudo)
                      const isExpanded = expandedLuisDay === day;
                      const visibleList = isExpanded ? luisList : luisList.slice(0, 2);
                    
                      return (
                        <td
                          key={day}
                          onMouseEnter={() => setHoverLuisDay(day)}
                          onMouseLeave={() => setHoverLuisDay((p) => (p === day ? null : p))}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => onDrop(member, day)}
                          className={`flex-1 min-w-[100px] border-r border-slate-200 cursor-pointer relative align-top ${
                            isWeekend ? 'bg-slate-50/80' : ''
                          }`}
                        >
                          {!isPrintMode && hoverLuisDay === day && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openLuisNew(day); // ✅ botão + continua a CRIAR
                              }}
                              className="absolute top-1 right-1 z-20 px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black shadow-lg hover:bg-indigo-500"
                              title="Adicionar Agenda/Reunião"
                            >
                              +
                            </button>
                          )}
                    
                          <div onClick={() => toggleDayStatus(member, day)} className="h-full w-full">
                            <div className="p-1.5 space-y-1">
                              {visibleList.map(({ e: ent, idx }: any) => {
                                const time =
                                  ent?.time && ent.time !== 'Dia Todo'
                                    ? ent.time
                                    : ent?.time === 'Dia Todo'
                                      ? 'Dia Todo'
                                      : '';
                    
                                const title = ent?.note || 'Sem descrição';
                    
                                return (
                                  <div
                                    key={idx}
                                    className="gcal-block gcal-luis group/item"
                                    onMouseEnter={(e) =>
                                      showHoverCard(e, {
                                        kind: 'LUIS',
                                        day,
                                        title: 'Agenda / Reunião',
                                        time,
                                        note: title
                                      })
                                    }
                                    onMouseLeave={hideHoverCard}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTempNote(ent?.note || '');
                                      setIsFullDay(ent?.time === 'Dia Todo');
                                      setTempTime(ent?.time && ent.time !== 'Dia Todo' ? ent.time : '09:00-13:00');
                                      setNoteModal({
                                        show: true,
                                        member: 'Luís Ferreira',
                                        day,
                                        type: 'Agenda / Reunião',
                                        existingData: ent,
                                        editIndex: idx
                                      });
                                    }}
                                  >
                                    <div className="gcal-block-text">
                                      {time ? <div className="gcal-block-time">{time}</div> : null}
                                      <div className="gcal-block-title">{title}</div>
                                    </div>
                    
                                    <button
                                      className="gcal-x opacity-0 group-hover/item:opacity-100"
                                      title="Remover"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        hideHoverCard();              // ✅ fecha já
                                        removeIndexed('Luís Ferreira', day, idx);
                                      }}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                );
                              })}
                    
                              {/* ✅ Botão expandir (em vez de abrir modal) */}
                              {luisList.length > 2 && !isExpanded && (
                                <button
                                  className="gcal-more"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedLuisDay(day); // ✅ EXPANDE e mostra tudo
                                  }}
                                >
                                  +{luisList.length - 2} mais
                                </button>
                              )}
                    
                              {/* ✅ Botão colapsar */}
                              {isExpanded && (
                                <button
                                  className="gcal-more"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedLuisDay(null); // ✅ VOLTA A MOSTRAR SÓ 2
                                  }}
                                >
                                  Mostrar menos
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    }
                     // ==========================
                     // RESTO (colaboradores igual ao teu código)
                     // ==========================
                     const m = String(currentMonth + 1).padStart(2, '0');
                     const d = String(day).padStart(2, '0');
                     const rawStatus = scheduleData[`${member}-2026-${m}-${d}`];
                     const entries = rawStatus ? [rawStatus] : [];
                 
                     return (
                       <td
                         key={day}
                         onClick={() => toggleDayStatus(member, day)}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={() => onDrop(member, day)}
                         className={`flex-1 min-w-[100px] p-1 border-r border-slate-200 cursor-pointer relative group/cell overflow-hidden ${isWeekend ? 'bg-slate-50/80' : ''}`}
                       >
                         <div className="flex flex-col gap-0.5 h-full">
                           {entries.map((ent: any, idx: number) => {
                             const type = typeof ent === 'object' && ent !== null ? ent.type : (ent || 'Trabalho');
                             const period = ent?.period || 'Full';
                             if (type === 'Trabalho') return null;
                 
                             const isDimmed = highlightFilter ? (type !== highlightFilter) : false;
                 
                             const fullTitle = String(ent?.note || '');
                             const shortTitle = fullTitle.length > 40 ? `${fullTitle.slice(0, 40)}…` : fullTitle;
                 
                             return (
                               <motion.div
                                 key={idx}
                                 title={ent?.note ? `${ent?.time ? `${ent.time} — ` : ''}${ent.note}` : (ent?.time || '')}
                                 draggable={type !== 'Trabalho'}
                                 onDragStart={() => onDragStart(member, day, ent)}
                                 onClick={(e) => {
                                  const t = typeof ent === 'object' && ent !== null ? ent.type : (ent || 'Trabalho');
                                
                                  const typesWithNotes = [
                                    'Banco de Horas',
                                    'Tolerância de Ponto',
                                    'Gozo Feriado',
                                    'Visita Guiada',
                                    'Feira',
                                    'Formação',
                                    'Serviço Externo',
                                    'Agenda / Reunião',
                                    'Evento Global'
                                  ];
                                
                                  if (!typesWithNotes.includes(t)) return; // ✅ não abre modal para Folga/Férias/Baixa/etc
                                
                                  e.stopPropagation();
                                  setTempNote(ent?.note || '');
                                  setIsFullDay(ent?.time === 'Dia Todo');
                                  setTempTime(ent?.time && ent.time !== 'Dia Todo' ? ent.time : '09:00-13:00');
                                  setNoteModal({ show: true, member, day, type: t, existingData: ent, editIndex: idx });
                                }}
                                 className={`flex flex-col items-center justify-start text-[8px] font-black border-2 transition-all duration-300 relative ${COLORS[type]} ${period === 'Morning' ? 'w-[60%] mr-auto rounded-lg rounded-r-none' : period === 'Afternoon' ? 'w-[60%] ml-auto rounded-lg rounded-l-none' : 'w-full rounded-lg'} min-h-[14px] group/item leading-tight px-2 py-1 overflow-hidden max-w-full ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                               >
                                 <div className="text-[9px] font-black leading-snug text-center">
  {ABSENCE_CONFIG[type as AbsenceType]?.label || type}
</div>

{ent?.note && (
  <div className="text-[8px] font-bold opacity-95 w-full text-center leading-snug">
    <span className="inline-block max-w-full clamp-2 align-top break-words">
      {shortTitle}
    </span>
  </div>
)}
                               </motion.div>
                             );
                           })}
                         </div>
                       </td>
                     );
                   })}
                 
                   <td className="w-12 border-l border-slate-300 flex items-center justify-center font-black text-[10px] text-slate-600 bg-slate-50/80">
                     {daysArray.reduce((acc, d) => (getStatus(member, d) !== 'Trabalho' ? acc + 1 : acc), 0)}
                   </td>
                 </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 z-[100] bg-white/95 backdrop-blur-xl border-t-4 border-slate-900 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] shrink-0">
                  <tr className="flex w-full h-16">
                    <td className="w-52 min-w-[13rem] p-4 border-r border-slate-300 flex items-center gap-3 bg-slate-50/90 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                      
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-200 text-blue-600"><Users size={18} /></div>
                      <div><span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.1em] block">Equipa em</span><span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.05em]">Cobertura</span></div>
                    </td>
                    {dailyAnalysis.map((data, idx) => (
                      <td
                      key={idx}
                      onClick={() => setSelectedDayDetails(data)}
                      className={`relative flex-1 min-w-[100px] flex items-center justify-center border-r border-slate-300 cursor-pointer hover:bg-white transition-all group ${
                        data.isShort ? 'bg-rose-100 ring-2 ring-rose-200' : 'text-slate-800'
                      }`}
                    >
                      {data.isShort && (
                        <div className="absolute left-0 right-0 bottom-0 h-1 bg-rose-600 animate-pulse" />
                      )}
                    
                      {data.isShort && (
                        <>
                          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600" />
                          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping opacity-30" />
                        </>
                      )}
                    
                      <div className="flex flex-col items-center gap-0.5 group-hover:scale-110 transition-transform">
                        <span className={`text-[12px] font-black tracking-tighter ${data.isShort ? 'text-rose-700' : 'text-slate-900'}`}>
                          {data.totalPresent}
                        </span>
                        <div className={`w-3 h-0.5 rounded-full ${data.isShort ? 'bg-rose-500' : 'bg-blue-500'}`} />
                      </div>
                    </td>
                    ))}
                    <td className="w-12 bg-slate-50/90"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        </div>

        {!isPrintMode && (
          <div className="px-10 py-4 bg-[#0F172A] border-t border-white/10 relative overflow-hidden shrink-0">
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mr-4">Filtros</span>
              <button onClick={() => setHighlightFilter(highlightFilter === 'Agenda / Reunião' ? null : 'Agenda / Reunião')} className={`px-4 py-2 rounded-xl border transition-all ${highlightFilter === 'Agenda / Reunião' ? COLORS['Agenda / Reunião'] : 'bg-white/5 border-white/10 text-slate-400'}`}>
                <span className="text-[9px] font-black uppercase tracking-widest">💼 Reuniões</span>
              </button>
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              {(Object.keys(ABSENCE_CONFIG) as AbsenceType[]).map((type) => (
                <button key={type} onClick={() => setHighlightFilter(highlightFilter === type ? null : type)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${highlightFilter === type ? COLORS[type] + ' border-white/30 shadow-md ring-1 ring-white/10' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/5'}`}>
                  <div className={`w-2 h-2 rounded-full ${COLORS[type].split(' ')[0]}`} />
                  <span className="text-[9px] font-black tracking-[0.1em] uppercase whitespace-nowrap">{ABSENCE_CONFIG[type].label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  table { border-collapse: separate !important; }
  .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  [draggable="true"] { cursor: grab; }
  [draggable="true"]:active { cursor: grabbing; opacity: 0.6; }

  .clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  /* ===== Blocão tipo Google (mais quadrado, 2 linhas visíveis) ===== */
.gcal-block{
  display:flex;
  align-items:stretch;
  justify-content:space-between;
  gap:6px;

  padding:8px;
  min-height:40px;
  border-radius:6px;

  background:#eef2ff; /* base clara */
  border:1px solid rgba(15,23,42,0.10);
  box-shadow:none;

  overflow:hidden;
}

.gcal-block:hover{ filter: brightness(0.98); }

.gcal-block-text{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column;
  gap:2px;
}

.gcal-block-time{
  font-size:9px;
  font-weight:800;
  color:#111827;
  line-height:1;
  white-space:nowrap;
}

.gcal-block-title{
  font-size:10px;
  font-weight:800;
  color:#111827;
  line-height:1.1;

  display:-webkit-box;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;     /* ✅ 2 linhas SEM hover */
  overflow:hidden;
}

.gcal-x{
  width:22px;
  min-width:22px;
  height:22px;
  border-radius:6px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:transparent;
  border:none;
  color:#111827;
}

.gcal-x:hover{ background: rgba(0,0,0,0.08); }

.gcal-more{
  width:100%;
  text-align:left;
  font-size:10px;
  font-weight:900;
  color:#1a73e8;
  padding:2px 2px;
}

.gcal-more:hover{ text-decoration:underline; }

/* só muda a “risca” lateral (tipo Google) */
.gcal-luis{ border-left:5px solid #4f46e5; background:#eef2ff; }
.gcal-global{ border-left:5px solid #7c3aed; background:#f3e8ff; }

  /* ==========================
     REVAMP (só Luís / GLOBAL): cartões horizontais legíveis
     ========================== */
  .lf-pill {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
    word-break: break-word !important;
  }
`}</style>
    </div>
  );
}