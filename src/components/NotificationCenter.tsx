import React from "react";
import { Lead, StatusFunil } from "../types";
import { 
  AlertTriangle, Clock, Phone, MessageSquare, ArrowRight, 
  Sparkles, CheckSquare, BellOff, Volume2 
} from "lucide-react";
import { getLeadStatus, formatPhone, getWhatsAppLink, getCallLink, formatRelativeDate } from "../utils";

interface NotificationCenterProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  currentTime: string;
}

export default function NotificationCenter({ leads, onSelectLead, currentTime }: NotificationCenterProps) {
  const now = new Date(currentTime);
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const twoHoursFromNow = new Date(now.getTime() + twoHoursMs);

  // 1. Overdue leads (red status)
  const overdueLeads = leads.filter((l) => {
    return getLeadStatus(l, currentTime) === "red";
  });

  // 2. Scheduled for the next 2 hours
  const upcomingLeads = leads.filter((l) => {
    if (l.statusFunil === StatusFunil.CLIENTE_GANHO || l.statusFunil === StatusFunil.PERDIDO) return false;
    if (!l.dataProximoContato) return false;

    const nextDate = new Date(l.dataProximoContato);
    return nextDate >= now && nextDate <= twoHoursFromNow;
  });

  const totalAlerts = overdueLeads.length + upcomingLeads.length;

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <h2 className="text-lg font-bold font-display">Central de Alertas de Prospecção</h2>
          </div>
          <p className="text-xs text-slate-300">
            Acompanhe em tempo real os follow-ups expirados ou próximos do vencimento. A eficiência no tempo de resposta aumenta as taxas de fechamento B2B em até 40%.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl flex gap-4 shrink-0 text-xs font-mono">
          <div>
            <p className="text-slate-400">Atrasados</p>
            <p className="text-rose-400 text-lg font-bold">{overdueLeads.length}</p>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <p className="text-slate-400">Próximas 2h</p>
            <p className="text-amber-400 text-lg font-bold">{upcomingLeads.length}</p>
          </div>
        </div>
      </div>

      {/* Main Alarms Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Overdue (Atrasados) Card Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-rose-950/50 bg-rose-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-450">
              <AlertTriangle size={18} className="animate-pulse" />
              <h3 className="font-bold text-sm font-display">Contatos Atrasados ({overdueLeads.length})</h3>
            </div>
            <span className="text-[10px] bg-rose-500/25 text-rose-300 border border-rose-900/30 font-bold px-2 py-0.5 rounded-full uppercase">
              Urgência Máxima
            </span>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-3 max-h-[480px]">
            {overdueLeads.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <div className="text-2xl">😎</div>
                <p className="text-xs font-bold text-slate-400">Nenhum follow-up atrasado!</p>
                <p className="text-[11px] text-slate-500">Sua fila operacional está limpa e no prumo.</p>
              </div>
            ) : (
              overdueLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <h4 
                      onClick={() => onSelectLead(lead)}
                      className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {lead.nome}
                    </h4>
                    <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                      <Clock size={12} />
                      Atrasado desde {formatRelativeDate(lead.dataProximoContato)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Segmento: {lead.cnae} • {lead.municipio_uf}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
                    <a 
                      href={getCallLink(lead.telefone1)} 
                      className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Ligar"
                    >
                      <Phone size={14} className="group-hover:animate-phone-ring" />
                    </a>
                    <a 
                      href={getWhatsAppLink(lead.telefone1, lead.nome)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageSquare size={14} />
                    </a>
                    <button 
                      onClick={() => onSelectLead(lead)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all"
                    >
                      Iniciar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring soon (Próximas 2 Horas) Card Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-amber-950/50 bg-amber-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-450">
              <Clock size={18} />
              <h3 className="font-bold text-sm font-display">Próximas 2 Horas ({upcomingLeads.length})</h3>
            </div>
            <span className="text-[10px] bg-amber-500/25 text-amber-300 border border-amber-900/30 font-bold px-2 py-0.5 rounded-full uppercase">
              Alerta de Fila
            </span>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-3 max-h-[480px]">
            {upcomingLeads.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <div className="text-2xl">☕</div>
                <p className="text-xs font-bold text-slate-400">Nenhum compromisso imediato nas próximas 2 horas.</p>
                <p className="text-[11px] text-slate-500">Aproveite o tempo livre para prospectar novos leads.</p>
              </div>
            ) : (
              upcomingLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <h4 
                      onClick={() => onSelectLead(lead)}
                      className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {lead.nome}
                    </h4>
                    <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <Clock size={12} />
                      Vence em breve: {formatRelativeDate(lead.dataProximoContato)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Segmento: {lead.cnae} • {lead.municipio_uf}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
                    <a 
                      href={getCallLink(lead.telefone1)} 
                      className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Ligar"
                    >
                      <Phone size={14} className="group-hover:animate-phone-ring" />
                    </a>
                    <a 
                      href={getWhatsAppLink(lead.telefone1, lead.nome)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageSquare size={14} />
                    </a>
                    <button 
                      onClick={() => onSelectLead(lead)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold text-xs rounded-lg transition-all"
                    >
                      Contatar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Outbound Quick Dial Blueprint Summary Info */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex gap-3 text-xs text-slate-300">
        <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p>
          <strong>Dica do Especialista em Vendas Ativas B2B:</strong> Ao abrir um contato atrasado, utilize as ligações telefônicas rápidas para tentar falar com o decisor. Caso o decisor não atenda, clique no botão <strong>WhatsApp</strong> para enviar uma mensagem pré-formatada. Em seguida, registre a <strong>Tentativa de Contato</strong> no histórico do lead e reagende o follow-up para dali a 2 horas ou para o dia seguinte.
        </p>
      </div>

    </div>
  );
}
