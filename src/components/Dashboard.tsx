import React from "react";
import { Lead, StatusFunil } from "../types";
import { 
  Users, CheckCircle2, Calendar, AlertTriangle, TrendingUp, 
  Phone, MessageSquare, ArrowRight, Play, CheckCircle
} from "lucide-react";
import { getLeadStatus, formatPhone, formatRelativeDate, getWhatsAppLink, getCallLink } from "../utils";

interface DashboardProps {
  leads: Lead[];
  totalGeralCount?: number;
  onSelectLead: (lead: Lead) => void;
  currentTime: string;
}

export default function Dashboard({ leads, totalGeralCount, onSelectLead, currentTime }: DashboardProps) {
  const now = new Date(currentTime);
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Calculate Metrics
  const totalLeads = leads.length;
  const showGeralBadge = typeof totalGeralCount === "number" && totalGeralCount !== totalLeads;

  // Contacted Today: dataUltimoContato is today (same date)
  const contatadosHoje = leads.filter(l => {
    if (!l.dataUltimoContato) return false;
    const lastContactDate = new Date(l.dataUltimoContato).toISOString().split("T")[0];
    return lastContactDate === todayStr;
  }).length;

  // Scheduled for Today: dataProximoContato is today
  const agendadosHoje = leads.filter(l => {
    if (!l.dataProximoContato) return false;
    // Don't count finished leads
    if (l.statusFunil === StatusFunil.CLIENTE_GANHO || l.statusFunil === StatusFunil.PERDIDO) return false;
    const nextContactDate = new Date(l.dataProximoContato).toISOString().split("T")[0];
    return nextContactDate === todayStr;
  }).length;

  // Overdue leads: dataProximoContato < now and not won/lost
  const leadsAtrasados = leads.filter(l => {
    return getLeadStatus(l, currentTime) === "red";
  }).length;

  // Conversion rate: (Won Leads / Total Leads) * 100
  const wonLeadsCount = leads.filter(l => l.statusFunil === StatusFunil.CLIENTE_GANHO).length;
  const taxaConversao = totalLeads > 0 ? Math.round((wonLeadsCount / totalLeads) * 100) : 0;

  // 2. Daily Tasks: Need contact TODAY or is OVERDUE, sorted by priority (overdue first, then by time)
  const tarefasDoDia = leads.filter(l => {
    if (l.statusFunil === StatusFunil.CLIENTE_GANHO || l.statusFunil === StatusFunil.PERDIDO) return false;
    if (!l.dataProximoContato) return false;
    
    const status = getLeadStatus(l, currentTime);
    return status === "red" || status === "yellow";
  }).sort((a, b) => {
    // Overdue (red) comes before Today (yellow)
    const statusA = getLeadStatus(a, currentTime);
    const statusB = getLeadStatus(b, currentTime);
    if (statusA === "red" && statusB !== "red") return -1;
    if (statusA !== "red" && statusB === "red") return 1;

    // Then sort chronologically by date
    if (!a.dataProximoContato || !b.dataProximoContato) return 0;
    return new Date(a.dataProximoContato).getTime() - new Date(b.dataProximoContato).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Leads (region-scoped, with general total badge) */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-800 text-slate-300 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {showGeralBadge ? "Leads Nesta Região" : "Total de Leads"}
            </p>
            <h4 className="text-2xl font-bold font-display text-white mt-0.5">{totalLeads}</h4>
            {showGeralBadge ? (
              <span className="text-[10px] text-slate-500">de {totalGeralCount} na base geral</span>
            ) : (
              <span className="text-[10px] text-slate-500">Na base ativa</span>
            )}
          </div>
        </div>

        {/* Contatados Hoje */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contatos Hoje</p>
            <h4 className="text-2xl font-bold font-display text-emerald-400 mt-0.5">{contatadosHoje}</h4>
            <span className="text-[10px] text-emerald-400/80 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Realizados</span>
          </div>
        </div>

        {/* Agendados para Hoje */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm border-l-4 border-l-amber-400 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agendados Hoje</p>
            <h4 className="text-2xl font-bold font-display text-amber-400 mt-0.5">{agendadosHoje}</h4>
            <span className="text-[10px] text-slate-500 font-semibold">Próximas 24h</span>
          </div>
        </div>

        {/* Leads Atrasados */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm border-l-4 border-l-rose-500 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
            <AlertTriangle size={20} className={leadsAtrasados > 0 ? "animate-bounce" : ""} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads Atrasados</p>
            <h4 className={`text-2xl font-bold font-display mt-0.5 ${leadsAtrasados > 0 ? "text-rose-400" : "text-white"}`}>
              {leadsAtrasados}
            </h4>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${leadsAtrasados > 0 ? "bg-rose-500/10 text-rose-400 underline cursor-pointer" : "text-slate-500"}`}>
              {leadsAtrasados > 0 ? "Ação imediata" : "Em dia!"}
            </span>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-blue-600 p-4 rounded-xl text-white shadow-md flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="p-3 bg-blue-700/50 text-blue-100 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Taxa Conversão</p>
            <h4 className="text-2xl font-bold font-display text-white mt-0.5">{taxaConversao}%</h4>
            <span className="text-[10px] text-blue-200">{wonLeadsCount} ganhos</span>
          </div>
        </div>

      </div>

      {/* 2. Tasks & Workflow Workspace */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              Tarefas Comerciais do Dia (Outbound Call Pipeline)
            </h3>
            <p className="text-xs text-slate-400">Leads que precisam de ligação imediata ou follow-up hoje, ordenados por urgência.</p>
          </div>
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 text-xs font-bold rounded-lg font-mono">
            {tarefasDoDia.length} Tarefas Pendentes
          </span>
        </div>

        <div className="p-6">
          {tarefasDoDia.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xl">
                🎉
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Nenhum follow-up atrasado ou agendado para hoje!</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Parabéns! Sua carteira de prospecção ativa está em dia. Adicione novos leads ou avance nos contatos de prospecção futura.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20">
                    <th className="py-3 px-4">Prioridade / Status</th>
                    <th className="py-3 px-4">Empresa / CNAE</th>
                    <th className="py-3 px-4">Localização</th>
                    <th className="py-3 px-4">Agendado Para</th>
                    <th className="py-3 px-4">Canais Rápidos</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {tarefasDoDia.map((lead, idx) => {
                    const status = getLeadStatus(lead, currentTime);
                    const isOverdue = status === "red";
                    const formattedTime = lead.dataProximoContato 
                      ? new Date(lead.dataProximoContato).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
                      : "";

                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors group">
                        
                        {/* Status badge */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-900/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                Atrasado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-900/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Hoje às {formattedTime}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-300 italic bg-slate-800 px-1.5 py-0.5 rounded">
                              {lead.statusFunil}
                            </span>
                          </div>
                        </td>

                        {/* Company Detail */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => onSelectLead(lead)}>
                              {lead.nome}
                            </p>
                            <p className="text-xs text-slate-400 font-mono select-all truncate max-w-[200px] mt-0.5" title={lead.cnae}>
                              CNAE: {lead.cnaeCodigo}
                            </p>
                          </div>
                        </td>

                        {/* City / State */}
                        <td className="py-4 px-4">
                          <span className="text-xs font-medium text-slate-300">
                            {lead.municipio_uf}
                          </span>
                        </td>

                        {/* Scheduled time info */}
                        <td className="py-4 px-4">
                          <div className="text-xs font-mono">
                            <p className={isOverdue ? "text-rose-400 font-bold" : "text-slate-300"}>
                              {formatRelativeDate(lead.dataProximoContato)}
                            </p>
                          </div>
                        </td>

                        {/* Quick speed triggers */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            {/* Call button */}
                            <a 
                              href={getCallLink(lead.telefone1)}
                              className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title={`Ligar para ${formatPhone(lead.telefone1)}`}
                            >
                              <Phone size={14} className="group-hover:animate-phone-ring" />
                            </a>
                            
                            {/* WhatsApp button */}
                            <a 
                              href={getWhatsAppLink(lead.telefone1, lead.nome)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                              title="Iniciar WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          </div>
                        </td>

                        {/* Action - Open Detail */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Play size={10} className="fill-current" />
                            Iniciar Contato
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
