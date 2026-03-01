// types/schedule.ts

export type AbsenceType =
  | 'Trabalho'
  | 'Folga'
  | 'Férias'
  | 'Gozo Feriado'
  | 'Visita Guiada'
  | 'Feira'
  | 'Formação'
  | 'Serviço Externo';

export const TEAM_MEMBERS = [
  'Ana Cristina',
  'Carlos Malheiro',
  'Cristiana Silva',
  'Carla Vides',
  'Hugo Barros',
  'Joana Situ',
  'Mário Malheiro',
  'Pedro Abreu',
  'Paula Rodrigues',
  'Soraia Pinto',
  'Serafim Torres',
  'Tiago Pinto',
  'Vitor Afonso',
];

export const ABSENCE_CONFIG: Record<
  AbsenceType,
  { color: string; label: string; short: string }
> = {
  Trabalho: {
    color: 'bg-white text-slate-400 border-slate-100',
    label: 'Normal',
    short: 'T',
  },
  Folga: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Folga',
    short: 'FO',
  },
  Férias: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Férias',
    short: 'FE',
  },
  'Gozo Feriado': {
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    label: 'Gozo Feriado',
    short: 'GF',
  },
  'Visita Guiada': {
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    label: 'Visita',
    short: 'VG',
  },
  Feira: {
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'Feira',
    short: 'FR',
  },
  Formação: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Formação',
    short: 'FM',
  },
  'Serviço Externo': {
    color: 'bg-slate-200 text-slate-600 border-slate-300',
    label: 'Ext.',
    short: 'SE',
  },
};

export const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
