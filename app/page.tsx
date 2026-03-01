// app/page.tsx
import ScheduleApp from '@/components/ScheduleApp';

export const metadata = {
  title: 'Gestão de Escalas 2026 | Backoffice',
  description: 'Sistema profissional de gestão de equipa e ausências',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* O componente ScheduleApp contém toda a lógica da tabela, 
        painel lateral e gestão de estados de 2026.
      */}
      <ScheduleApp />
    </div>
  );
}
