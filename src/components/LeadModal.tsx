import React, { useState } from "react";
import { Lead, StatusFunil, NotaHistorico } from "../types";
import { 
  X, Phone, Mail, Calendar, MapPin, Clock, User, 
  FileText, ArrowRight, MessageSquare, ExternalLink, PlusCircle
} from "lucide-react";
import { 
  formatCNPJ, formatCEP, formatPhone, getLeadStatus, 
  formatRelativeDate, getMailtoLink, getWhatsAppLink, getCallLink 
} from "../utils";

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  currentTime: string;
}

export default function LeadModal({ lead, isOpen, onClose, onUpdateLead, currentTime }: LeadModalProps) {
  if (!isOpen || !lead) return null;

  const [interactionText, setInteractionText] = useState("");
  const [nextContactDate, setNextContactDate] = useState(
    lead.dataProximoContato ? lead.dataProximoContato.substring(0, 16) : ""
  );
  const [newStatus, setNewStatus] = useState<StatusFunil>(lead.statusFunil);
  const [autorName, setAutorName] = useState("Tailan Fogaça"); // Logged user

  const leadStatus = getLeadStatus(lead, currentTime);

  const handleSubmitInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionText.trim()) return;

    // Create a new interaction note
    const newNote: NotaHistorico = {
      data: new Date().toISOString(),
      autor: autorName,
      texto: interactionText.trim()
    };

    // Update lead attributes
    const updatedLead: Lead = {
      ...lead,
      statusFunil: newStatus,
      dataUltimoContato: new Date().toISOString(),
      dataProximoContato: nextContactDate ? new Date(nextContactDate).toISOString() : null,
      notasHistorico: [newNote, ...lead.notasHistorico] // Prepend to show chronologically inverted
    };

    onUpdateLead(updatedLead);
    setInteractionText(""); // reset form
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="lead-detail-modal"
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                ${lead.statusFunil === StatusFunil.CLIENTE_GANHO ? "bg-emerald-500/15 text-emerald-300 border-emerald-900/30" : ""}
                ${lead.statusFunil === StatusFunil.PERDIDO ? "bg-rose-500/15 text-rose-300 border-rose-900/30" : ""}
                ${lead.statusFunil === StatusFunil.SEM_CONTATO ? "bg-slate-800 text-slate-300 border-slate-700" : ""}
                ${lead.statusFunil === StatusFunil.TENTATIVA_CONTATO ? "bg-amber-500/15 text-amber-300 border-amber-900/30" : ""}
                ${lead.statusFunil === StatusFunil.CONTATO_ESTABELECIDO ? "bg-blue-500/15 text-blue-300 border-blue-900/30" : ""}
                ${lead.statusFunil === StatusFunil.PROPOSTA_ENVIADA ? "bg-indigo-500/15 text-indigo-300 border-indigo-900/30" : ""}
              `}>
                {lead.statusFunil}
              </span>

              {leadStatus === "red" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-600 text-white animate-pulse">
                  Contato Atrasado
                </span>
              )}
              {leadStatus === "yellow" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-600 text-slate-950 font-bold">
                  Contatar Hoje
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold font-display text-white mt-1">{lead.nome}</h2>
            <p className="text-xs text-slate-450 truncate max-w-xl">{lead.razaoSocial}</p>
          </div>
          <button 
            id="close-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable Split Pane) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/60">
          
          {/* Left Column - Company Information (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-6 bg-slate-950/15">
            {/* Quick Actions Panel */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Ações de Prospecção Veloz</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Telefone 1 Dial */}
                <a 
                  id="btn-call-tel1"
                  href={getCallLink(lead.telefone1)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Efetuar Ligação Telefônica"
                >
                  <Phone size={15} className="animate-phone-ring" />
                  Ligar Tel 1
                </a>

                {/* Telefone 1 WhatsApp */}
                <a 
                  id="btn-whatsapp-tel1"
                  href={getWhatsAppLink(lead.telefone1, lead.nome)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Abrir WhatsApp Web"
                >
                  <MessageSquare size={15} />
                  WhatsApp
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Telefone 2 Dial (if available) */}
                {lead.telefone2 ? (
                  <a 
                    id="btn-call-tel2"
                    href={getCallLink(lead.telefone2)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Phone size={14} />
                    Ligar Tel 2
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-slate-600 border border-slate-850/60 text-xs font-medium rounded-lg cursor-not-allowed">
                    <Phone size={14} />
                    Sem Tel 2
                  </button>
                )}

                {/* Email Client mailto */}
                <a 
                  id="btn-send-email"
                  href={getMailtoLink(lead.email, lead.nome)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 text-xs font-medium rounded-lg transition-colors"
                  title="Enviar E-mail Comercial"
                >
                  <Mail size={14} />
                  Enviar E-mail
                </a>
              </div>
            </div>

            {/* CAD Info Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-slate-500" />
                Dados Cadastrais B2B
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-450 font-sans">CNPJ</label>
                  <span className="font-mono font-semibold text-slate-200">{formatCNPJ(lead.cnpj)}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-450 font-sans">Razão Social</label>
                  <span className="text-slate-200 break-words font-medium">{lead.razaoSocial}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-450 font-sans">E-mail</label>
                    <span className="text-slate-200 break-all select-all font-medium">{lead.email}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-450 font-sans">Telefones</label>
                    <span className="text-slate-200 block font-medium">{formatPhone(lead.telefone1)}</span>
                    {lead.telefone2 && <span className="text-slate-400 text-xs block font-mono">{formatPhone(lead.telefone2)}</span>}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <MapPin size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-slate-200">{lead.endereco}</p>
                      <p className="text-slate-400">CEP {formatCEP(lead.cep)} • {lead.municipio_uf}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                  <label className="block text-xs font-medium text-slate-450 font-sans">Segmentação CNAE Principal</label>
                  <div className="bg-slate-950 p-3 rounded-lg text-xs space-y-1 border border-slate-850">
                    <p className="font-mono font-bold text-blue-300 bg-blue-500/15 border border-blue-900/20 inline-block px-1.5 py-0.5 rounded">
                      CNAE {lead.cnaeCodigo}
                    </p>
                    <p className="font-medium text-slate-200 mt-1">{lead.cnae}</p>
                    <p className="text-slate-450 italic text-[11px] leading-tight mt-1">{lead.cnaeDesc}</p>
                  </div>
                </div>

                {/* Geographical coordinates */}
                <div className="border-t border-slate-800/80 pt-3 text-xs flex justify-between items-center text-slate-500">
                  <span>Geolocalização (LatLng)</span>
                  <span className="font-mono text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                    {lead.latLng.lat.toFixed(4)}, {lead.latLng.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactions and Follow-up (7 cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col h-full overflow-hidden">
            
            {/* Save Interaction Form */}
            <form onSubmit={handleSubmitInteraction} className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl space-y-4 mb-6">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle size={14} />
                Registrar Novo Contato / Interação
              </h3>

              <div className="space-y-3">
                {/* Text Description of Interaction */}
                <div>
                  <label className="block text-xs font-medium text-slate-350 mb-1">
                    O que aconteceu no contato atual? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="input-interaction-text"
                    required
                    value={interactionText}
                    onChange={(e) => setInteractionText(e.target.value)}
                    placeholder="Ex: Liguei e conversei com o decisor Sr. Marcos, apresentou interesse mas pediu para enviar a tabela de preços. Retorno agendado..."
                    className="w-full text-sm bg-slate-900 border border-slate-800 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/60 rounded-lg p-2.5 h-20 resize-none outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Next Follow-up (Data Próximo Contato) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-350 mb-1 flex items-center gap-1">
                      <Calendar size={12} />
                      Próximo Contato (Follow-up)
                    </label>
                    <input
                      id="input-followup-date"
                      type="datetime-local"
                      value={nextContactDate}
                      onChange={(e) => setNextContactDate(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/60 rounded-lg p-2 outline-none transition-all"
                    />
                  </div>

                  {/* Stage Shift (Status_Funil) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-350 mb-1 flex items-center gap-1">
                      <ArrowRight size={12} />
                      Mudar Estágio do Funil
                    </label>
                    <select
                      id="select-stage-shift"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as StatusFunil)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/60 rounded-lg p-2 outline-none transition-all"
                    >
                      {Object.values(StatusFunil).map((status) => (
                        <option key={status} value={status} className="bg-slate-900 text-slate-150">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* SDR Agent Name */}
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 uppercase">SDR Responsável</label>
                    <input 
                      type="text" 
                      value={autorName}
                      onChange={(e) => setAutorName(e.target.value)}
                      className="bg-transparent border-b border-slate-800 py-0.5 text-xs focus:border-blue-500 outline-none text-slate-300 font-medium"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      id="btn-save-interaction"
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Salvar Interação
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Interaction History Timeline */}
            <div className="flex-1 flex flex-col min-h-[150px] overflow-hidden">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
                <Clock size={14} className="text-slate-500" />
                Linha do Tempo (Histórico de Contatos)
              </h3>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {lead.notasHistorico.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-sm text-slate-400 font-medium">Nenhum histórico registrado.</p>
                    <p className="text-xs text-slate-500 mt-1">Preencha o formulário acima para registrar o primeiro contato comercial.</p>
                  </div>
                ) : (
                  <div className="relative pl-4 border-l border-blue-950/60 space-y-4 py-1">
                    {lead.notasHistorico.map((nota, idx) => (
                      <div key={idx} className="relative group">
                        {/* Timeline node */}
                        <div className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-950 group-first:bg-blue-600 group-first:ring-4 group-first:ring-blue-950/50 transition-all" />
                        
                        <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-3.5 rounded-xl shadow-2xs space-y-1.5 transition-all">
                          <div className="flex justify-between items-center text-[11px] text-slate-500 flex-wrap gap-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                              <User size={10} />
                              {nota.autor}
                            </span>
                            <span className="font-mono text-slate-500">
                              {formatRelativeDate(nota.data)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                            {nota.texto}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
