// types/schedule.ts

export type AbsenceType =
  | 'Trabalho'
  | 'Folga'
  | 'Férias'
  | 'Gozo Feriado'
  | 'Visita Guiada'
  | 'Feira'
  | 'Formação'
  | 'Serviço Externo'
  | 'Baixa Médica'
  | 'Trabalhador-Estudante'
  | 'Consulta Médica'
  | 'Banco de Horas'
  | 'Tolerância de Ponto';

// Define se a ausência é o dia todo ou apenas um turno
export type AbsencePeriod = 'Full' | 'Morning' | 'Afternoon';

// Estrutura para suportar notas e períodos parciais
export interface DayStatus {
  type: AbsenceType;
  period: AbsencePeriod;
  note?: string;
}

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
  'Baixa Médica': {
    color: 'bg-red-100 text-red-700 border-red-200',
    label: 'Baixa Médica',
    short: 'BM',
  },
  'Trabalhador-Estudante': {
    color: 'bg-lime-100 text-lime-700 border-lime-200',
    label: 'Trab. Estudante',
    short: 'TE',
  },
  'Consulta Médica': {
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    label: 'Consulta',
    short: 'CM',
  },
  'Banco de Horas': {
    color: 'bg-yellow-200 text-yellow-800 border-yellow-300',
    label: 'Banco Horas',
    short: 'BH',
  },
  'Tolerância de Ponto': {
    color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    label: 'Tolerância',
    short: 'TP',
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