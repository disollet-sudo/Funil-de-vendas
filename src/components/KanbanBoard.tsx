import React, { useState } from "react";
import { Lead, StatusFunil } from "../types";
import { 
  Phone, MessageSquare, AlertCircle, Calendar, ArrowLeft, ArrowRight,
  User, CheckCircle, Flame, Eye
} from "lucide-react";
import { getLeadStatus, formatPhone, getWhatsAppLink, getCallLink } from "../utils";

interface KanbanBoardProps {
  leads: Lead[];
  onMoveLead: (leadId: string, newStage: StatusFunil) => void;
  onSelectLead: (lead: Lead) => void;
  currentTime: string;
}

export default function KanbanBoard({ leads, onMoveLead, onSelectLead, currentTime }: KanbanBoardProps) {
  // To track which column has a card dragged over it for styling
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  // 1. Column Definition
  const columns: { stage: StatusFunil; title: string; color: string; border: string; bg: string }[] = [
    { 
      stage: StatusFunil.SEM_CONTATO, 
      title: "Sem Contato", 
      color: "text-slate-300 bg-slate-800", 
      border: "border-slate-800", 
      bg: "bg-slate-900/60" 
    },
    { 
      stage: StatusFunil.TENTATIVA_CONTATO, 
      title: "Tentativa de Contato", 
      color: "text-amber-300 bg-amber-500/15", 
      border: "border-amber-900/20", 
      bg: "bg-amber-950/10" 
    },
    { 
      stage: StatusFunil.CONTATO_ESTABELECIDO, 
      title: "Contato Estabelecido", 
      color: "text-blue-300 bg-blue-500/15", 
      border: "border-blue-900/20", 
      bg: "bg-blue-950/10" 
    },
    { 
      stage: StatusFunil.PROPOSTA_ENVIADA, 
      title: "Proposta Enviada", 
      color: "text-indigo-300 bg-indigo-500/15", 
      border: "border-indigo-900/20", 
      bg: "bg-indigo-950/10" 
    },
    { 
      stage: StatusFunil.CLIENTE_GANHO, 
      title: "Cliente Ganho", 
      color: "text-emerald-300 bg-emerald-500/15", 
      border: "border-emerald-900/20", 
      bg: "bg-emerald-950/10" 
    },
    { 
      stage: StatusFunil.PERDIDO, 
      title: "Perdido / Sem Interesse", 
      color: "text-rose-300 bg-rose-500/15", 
      border: "border-rose-900/20", 
      bg: "bg-rose-950/10" 
    },
  ];

  // 2. Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: StatusFunil) => {
    e.preventDefault();
    setDraggedOverCol(stage);
  };

  const handleDrop = (e: React.DragEvent, targetStage: StatusFunil) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      onMoveLead(leadId, targetStage);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  // Helper to move a lead to neighboring columns (mobile friendly fallback)
  const shiftLeadStage = (lead: Lead, direction: "left" | "right") => {
    const stageValues = Object.values(StatusFunil);
    const currentIndex = stageValues.indexOf(lead.statusFunil);
    
    let nextIndex = currentIndex;
    if (direction === "left" && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    } else if (direction === "right" && currentIndex < stageValues.length - 1) {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex !== currentIndex) {
      onMoveLead(lead.id, stageValues[nextIndex]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Visual Header */}
      <div className="bg-blue-950/30 border border-blue-900/40 p-4 rounded-xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-blue-200">
          <strong>Diretriz do Funil:</strong> Arraste e solte (Drag and Drop) os cartões das empresas para avançar ou recuar o estágio de prospecção, ou utilize as setas de transição rápida no rodapé de cada cartão.
        </div>
      </div>

      {/* Grid of Columns */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-280px)] min-h-[500px]">
          {columns.map((col) => {
            const colLeads = leads.filter((l) => l.statusFunil === col.stage);
            const isDraggedOver = draggedOverCol === col.stage;

            return (
              <div
                key={col.stage}
                onDragOver={(e) => handleDragOver(e, col.stage)}
                onDrop={(e) => handleDrop(e, col.stage)}
                onDragLeave={handleDragLeave}
                className={`flex-1 flex flex-col rounded-xl border p-3 min-w-[200px] transition-all duration-150
                  ${col.border} ${col.bg}
                  ${isDraggedOver ? "ring-2 ring-blue-500 bg-blue-900/40 scale-[1.01]" : ""}
                `}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                    <h4 className="font-bold text-xs text-slate-100 truncate" title={col.title}>
                      {col.title}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.color}`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                  {colLeads.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-800 rounded-lg flex items-center justify-center bg-slate-950/35 p-4">
                      <p className="text-[11px] text-slate-500 text-center">Nenhum lead nesta etapa</p>
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const status = getLeadStatus(lead, currentTime);
                      const isOverdue = status === "red";
                      const isToday = status === "yellow";

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className={`bg-slate-900 rounded-lg border border-slate-800 p-3.5 shadow-sm hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing group relative select-none
                            ${isOverdue ? "border-l-4 border-l-rose-500" : ""}
                            ${isToday ? "border-l-4 border-l-amber-500" : ""}
                          `}
                        >
                          {/* Alert indicators */}
                          {isOverdue && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse">
                              <AlertCircle size={10} />
                              Atrasado
                            </div>
                          )}
                          {isToday && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              <Calendar size={10} />
                              Hoje
                            </div>
                          )}

                          {/* Company name */}
                          <div className="pr-16">
                            <h5 
                              onClick={() => onSelectLead(lead)}
                              className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
                              title={lead.nome}
                            >
                              {lead.nome}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {lead.municipio_uf}
                            </span>
                          </div>

                          {/* CNAE and details */}
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-1.5" title={lead.cnae}>
                            CNAE: <span className="font-semibold text-slate-300">{lead.cnaeCodigo}</span> • {lead.cnae}
                          </p>

                          {/* Follow-up info */}
                          {lead.dataProximoContato && (
                            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400">
                              <Calendar size={11} className="text-slate-500" />
                              <span>Prox. Contato:</span>
                              <span className={`font-mono font-medium ${isOverdue ? "text-rose-400 font-bold" : "text-slate-300"}`}>
                                {new Date(lead.dataProximoContato).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às {new Date(lead.dataProximoContato).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}

                          {/* Interactive Row */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                            {/* Fast calling speed-dials */}
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={getCallLink(lead.telefone1)}
                                className="p-1 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 rounded-md transition-colors"
                                title={`Ligar: ${formatPhone(lead.telefone1)}`}
                              >
                                <Phone size={11} />
                              </a>
                              <a
                                href={getWhatsAppLink(lead.telefone1, lead.nome)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-emerald-500/30 text-emerald-400 hover:bg-emerald-500/50 rounded-md transition-colors"
                                title="Enviar WhatsApp"
                              >
                                <MessageSquare size={11} />
                              </a>
                            </div>

                            {/* View / Shift Controls */}
                            <div className="flex items-center gap-1">
                              {/* Open Detail Modal */}
                              <button
                                onClick={() => onSelectLead(lead)}
                                className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800"
                                title="Ver Ficha do Lead"
                              >
                                <Eye size={12} />
                              </button>

                              {/* Back Stage Button (for mobile clicks) */}
                              <button
                                onClick={() => shiftLeadStage(lead, "left")}
                                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md disabled:opacity-30 disabled:pointer-events-none"
                                title="Etapa Anterior"
                                disabled={columns.findIndex(c => c.stage === lead.statusFunil) === 0}
                              >
                                <ArrowLeft size={11} />
                              </button>

                              {/* Forward Stage Button (for mobile clicks) */}
                              <button
                                onClick={() => shiftLeadStage(lead, "right")}
                                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md disabled:opacity-30 disabled:pointer-events-none"
                                title="Avançar Etapa"
                                disabled={columns.findIndex(c => c.stage === lead.statusFunil) === columns.length - 1}
                              >
                                <ArrowRight size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
