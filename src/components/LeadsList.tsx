import React, { useState, useMemo } from "react";
import { Lead, StatusFunil } from "../types";
import { 
  Search, Filter, Plus, FileSpreadsheet, MapPin, Phone, 
  MessageSquare, Mail, AlertCircle, Calendar, ArrowUpDown, RefreshCw 
} from "lucide-react";
import { formatCNPJ, formatPhone, getLeadStatus, formatRelativeDate, getWhatsAppLink, getCallLink, getMailtoLink } from "../utils";

interface LeadsListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenAddModal: () => void;
  currentTime: string;
}

type SortField = "nome" | "statusFunil" | "municipio" | "dataProximoContato";
type SortOrder = "asc" | "desc";

export default function LeadsList({ leads, onSelectLead, onOpenAddModal, currentTime }: LeadsListProps) {
  // 1. Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUf, setSelectedUf] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCnae, setSelectedCnae] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // 2. Sort States
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 3. Clear Filters Action
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedUf("");
    setSelectedCity("");
    setSelectedCnae("");
    setSelectedStatus("");
  };

  // 4. Generate Dynamic Filter Options from current leads data
  const filterOptions = useMemo(() => {
    const ufs = new Set<string>();
    const cities = new Set<string>();
    const cnaes = new Set<string>(); // Stores Code + Name

    leads.forEach((l) => {
      if (l.uf) ufs.add(l.uf);
      if (l.municipio) cities.add(l.municipio);
      if (l.cnaeCodigo) cnaes.add(`${l.cnaeCodigo} - ${l.cnae.substring(0, 30)}...`);
    });

    return {
      ufs: Array.from(ufs).sort(),
      cities: Array.from(cities).sort(),
      cnaes: Array.from(cnaes).sort()
    };
  }, [leads]);

  // 5. Toggle Sorting
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 6. Filter and Sort logic
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Global Search: Name, CNPJ, Razão Social
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.nome.toLowerCase().includes(q) ||
          l.cnpj.replace(/\D/g, "").includes(q) ||
          l.cnpj.includes(q) ||
          l.razaoSocial.toLowerCase().includes(q)
      );
    }

    // Filter by State (UF)
    if (selectedUf !== "") {
      result = result.filter((l) => l.uf === selectedUf);
    }

    // Filter by City
    if (selectedCity !== "") {
      result = result.filter((l) => l.municipio === selectedCity);
    }

    // Filter by CNAE (starts with the code)
    if (selectedCnae !== "") {
      const code = selectedCnae.split(" - ")[0];
      result = result.filter((l) => l.cnaeCodigo === code);
    }

    // Filter by Funnel Status
    if (selectedStatus !== "") {
      result = result.filter((l) => l.statusFunil === selectedStatus);
    }

    // Sort result
    result.sort((a, b) => {
      let valA: any = a[sortField] || "";
      let valB: any = b[sortField] || "";

      if (sortField === "dataProximoContato") {
        valA = a.dataProximoContato ? new Date(a.dataProximoContato).getTime() : 0;
        valB = b.dataProximoContato ? new Date(b.dataProximoContato).getTime() : 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, searchQuery, selectedUf, selectedCity, selectedCnae, selectedStatus, sortField, sortOrder]);

  // Export base as JSON trigger
  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crm_leads_prospeccao_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            id="search-leads-input"
            type="text"
            placeholder="Pesquisar por Nome, CNPJ ou Razão Social..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-slate-900 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-slate-500 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          {/* Export JSON Button */}
          <button
            onClick={exportToJSON}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Exportar Base Completa em JSON"
          >
            <FileSpreadsheet size={15} />
            Exportar JSON
          </button>

          {/* Add Prospect Button */}
          <button
            id="btn-add-prospect"
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            Novo Prospect B2B
          </button>
        </div>
      </div>

      {/* Grid of Dropdown Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xs flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-2 uppercase">
          <Filter size={14} />
          Filtros de Nicho
        </div>

        {/* State Filter */}
        <div className="min-w-[100px] flex-1 sm:flex-none">
          <select
            value={selectedUf}
            onChange={(e) => setSelectedUf(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 hover:border-slate-600 rounded-lg p-2 outline-none transition-colors"
          >
            <option value="" className="bg-slate-900 text-slate-100">Todos Estados (UF)</option>
            {filterOptions.ufs.map((uf) => (
              <option key={uf} value={uf} className="bg-slate-900 text-slate-100">
                Estado: {uf}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="min-w-[150px] flex-1 sm:flex-none">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 hover:border-slate-600 rounded-lg p-2 outline-none transition-colors"
          >
            <option value="" className="bg-slate-900 text-slate-100">Todas Cidades</option>
            {filterOptions.cities.map((city) => (
              <option key={city} value={city} className="bg-slate-900 text-slate-100">
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* CNAE Segment Filter */}
        <div className="min-w-[200px] flex-1 sm:flex-none max-w-xs">
          <select
            value={selectedCnae}
            onChange={(e) => setSelectedCnae(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 hover:border-slate-600 rounded-lg p-2 outline-none transition-colors truncate"
          >
            <option value="" className="bg-slate-900 text-slate-100">Todos Segmentos (CNAE)</option>
            {filterOptions.cnaes.map((cnae) => (
              <option key={cnae} value={cnae} title={cnae} className="bg-slate-900 text-slate-100">
                {cnae}
              </option>
            ))}
          </select>
        </div>

        {/* Funnel Stage Filter */}
        <div className="min-w-[150px] flex-1 sm:flex-none">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 hover:border-slate-600 rounded-lg p-2 outline-none transition-colors"
          >
            <option value="" className="bg-slate-900 text-slate-100">Todos Estágios do Funil</option>
            {Object.values(StatusFunil).map((status) => (
              <option key={status} value={status} className="bg-slate-900 text-slate-100">
                Etapa: {status}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {(selectedUf || selectedCity || selectedCnae || selectedStatus || searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Leads Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20">
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort("nome")} className="flex items-center gap-1 hover:text-white font-bold cursor-pointer">
                    Razão Social / Nome Fantasia
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="py-3 px-4">CNPJ</th>
                <th className="py-3 px-4">CNAE Principal</th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort("municipio")} className="flex items-center gap-1 hover:text-white font-bold cursor-pointer">
                    Localização
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort("statusFunil")} className="flex items-center gap-1 hover:text-white font-bold cursor-pointer">
                    Etapa Funil
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort("dataProximoContato")} className="flex items-center gap-1 hover:text-white font-bold cursor-pointer">
                    Próximo Contato
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="py-3 px-4">Canais Rápidos</th>
                <th className="py-3 px-4 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <p className="text-sm text-slate-450 font-bold">Nenhum prospect comercial encontrado com os filtros selecionados.</p>
                    <p className="text-xs text-slate-500 mt-1">Experimente remover alguns critérios ou limpar a barra de pesquisas.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const status = getLeadStatus(lead, currentTime);
                  const isOverdue = status === "red";
                  const isToday = status === "yellow";

                  return (
                    <tr 
                      key={lead.id} 
                      className="hover:bg-slate-800/30 transition-colors group align-middle"
                    >
                      {/* Name and Razao */}
                      <td className="py-3.5 px-4 font-normal">
                        <div>
                          <p 
                            onClick={() => onSelectLead(lead)}
                            className="font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer text-sm"
                          >
                            {lead.nome}
                          </p>
                          <p className="text-[10px] text-slate-450 mt-0.5 truncate max-w-[240px]" title={lead.razaoSocial}>
                            {lead.razaoSocial}
                          </p>
                        </div>
                      </td>

                      {/* CNPJ */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        {formatCNPJ(lead.cnpj)}
                      </td>

                      {/* CNAE */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[180px]">
                          <p className="font-mono font-bold text-blue-300 bg-blue-500/15 border border-blue-900/20 px-1.5 py-0.5 rounded inline-block text-[10px]">
                            {lead.cnaeCodigo}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5" title={lead.cnae}>
                            {lead.cnae}
                          </p>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500 shrink-0" />
                          <span className="font-medium text-slate-300">{lead.municipio_uf}</span>
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border
                          ${lead.statusFunil === StatusFunil.CLIENTE_GANHO ? "bg-emerald-500/15 text-emerald-300 border-emerald-900/30" : ""}
                          ${lead.statusFunil === StatusFunil.PERDIDO ? "bg-rose-500/15 text-rose-300 border-rose-900/30" : ""}
                          ${lead.statusFunil === StatusFunil.SEM_CONTATO ? "bg-slate-800 text-slate-300 border-slate-700" : ""}
                          ${lead.statusFunil === StatusFunil.TENTATIVA_CONTATO ? "bg-amber-500/15 text-amber-300 border-amber-900/30" : ""}
                          ${lead.statusFunil === StatusFunil.CONTATO_ESTABELECIDO ? "bg-blue-500/15 text-blue-300 border-blue-900/30" : ""}
                          ${lead.statusFunil === StatusFunil.PROPOSTA_ENVIADA ? "bg-indigo-500/15 text-indigo-300 border-indigo-900/30" : ""}
                        `}>
                          {lead.statusFunil}
                        </span>
                      </td>

                      {/* Follow-up reminder */}
                      <td className="py-3.5 px-4">
                        {lead.dataProximoContato ? (
                          <div className="flex items-center gap-1.5">
                            {isOverdue && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Contato Atrasado" />}
                            {isToday && <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Contato Hoje" />}
                            <span className={`font-mono ${isOverdue ? "text-rose-400 font-bold" : "text-slate-300"}`}>
                              {formatRelativeDate(lead.dataProximoContato)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Não agendado</span>
                        )}
                      </td>

                      {/* Quick contacts */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={getCallLink(lead.telefone1)}
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"
                            title={`Ligar: ${formatPhone(lead.telefone1)}`}
                          >
                            <Phone size={12} className="group-hover:animate-phone-ring" />
                          </a>
                          <a
                            href={getWhatsAppLink(lead.telefone1, lead.nome)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                            title="WhatsApp Comercial"
                          >
                            <MessageSquare size={12} />
                          </a>
                          <a
                            href={getMailtoLink(lead.email, lead.nome)}
                            className="p-1.5 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-md transition-colors border border-slate-700/60"
                            title={`E-mail: ${lead.email}`}
                          >
                            <Mail size={12} />
                          </a>
                        </div>
                      </td>

                      {/* View Details */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Ficha
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table summary stats */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>Mostrando {filteredLeads.length} de {leads.length} prospects cadastrados</span>
          <span>Base Ativa B2B</span>
        </div>
      </div>
    </div>
  );
}
