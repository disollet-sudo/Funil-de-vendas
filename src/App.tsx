import React, { useState, useEffect } from "react";
import { Lead, StatusFunil, DashboardMetrics } from "./types";
import { INITIAL_LEADS } from "./data/mockLeads";
import { getLeadStatus } from "./utils";
import Papa from "papaparse";

const CAPITAL_COORDINATES: { [key: string]: { name: string, lat: number, lng: number } } = {
  SP: { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
  RJ: { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
  MG: { name: "Belo Horizonte", lat: -19.9173, lng: -43.9345 },
  RS: { name: "Porto Alegre", lat: -30.0346, lng: -51.2177 },
  PR: { name: "Curitiba", lat: -25.4290, lng: -49.2671 },
  SC: { name: "Florianópolis", lat: -27.5954, lng: -48.5480 },
  BA: { name: "Salvador", lat: -12.9714, lng: -38.5014 },
  PE: { name: "Recife", lat: -8.0543, lng: -34.8813 },
  DF: { name: "Brasília", lat: -15.7975, lng: -47.8919 },
  CE: { name: "Fortaleza", lat: -3.7327, lng: -38.5270 },
  GO: { name: "Goiânia", lat: -16.6869, lng: -49.2648 }
};

const FALLBACK_CSV_DATA = `CNPJ,Nome,Razão Social,Endereço,CEP,Município,UF,Município_UF,Telefone 1,Telefone 2,E-mail
12.345.678/0001-90,Di Solle Cutelaria,Di Solle Indústria e Comércio de Talheres Ltda,Av. Plínio Kroeff 1000 - Sarandi,91150-170,Porto Alegre,RS,Porto Alegre - RS,5133580000,5133580001,comercial@disolle.com.br
98.765.432/0001-10,Metalúrgica Di Solle,Di Solle Componentes Industriais Eireli,Rua dos Talheres 450 - Centro,95110-000,Caxias do Sul,RS,Caxias do Sul - RS,5432201234,5432201235,suprimentos@disolle.com
45.888.123/0001-44,Logística Di Solle,Di Solle Transportes de Cargas S/A,Av. das Indústrias 1530,90200-290,Porto Alegre,RS,Porto Alegre - RS,5196543210,5125843322,logistica@disolle.com.br`;

function parseCSVToLeads(csvText: string): Lead[] {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (!parsed.data || parsed.data.length === 0) {
    return [];
  }

  return (parsed.data as any[]).map((row, index) => {
    const cnpj = (row["CNPJ"] || "").trim();
    const nome = (row["Nome"] || "").trim();
    const razaoSocial = (row["Razão Social"] || "").trim();
    const endereco = (row["Endereço"] || "").trim();
    const cep = (row["CEP"] || "").trim();
    const municipio = (row["Município"] || "").trim();
    const uf = (row["UF"] || "SP").trim();
    const municipio_uf = (row["Município_UF"] || `${municipio} - ${uf}`).trim();
    const telefone1 = (row["Telefone 1"] || "").trim();
    const telefone2 = (row["Telefone 2"] || "").trim();
    const email = (row["E-mail"] || "").trim();

    const finalNome = nome || razaoSocial || "Lead sem Nome";
    const finalRazao = razaoSocial || nome || "Empresa sem Razão Social";

    const capitalInfo = CAPITAL_COORDINATES[uf] || CAPITAL_COORDINATES["SP"];
    const randomOffsetLat = (Math.random() - 0.5) * 0.15;
    const randomOffsetLng = (Math.random() - 0.5) * 0.15;
    const latLng = {
      lat: capitalInfo.lat + randomOffsetLat,
      lng: capitalInfo.lng + randomOffsetLng
    };

    return {
      id: cnpj ? `lead-${cnpj.replace(/\D/g, "")}` : `lead-${index}-${Date.now()}`,
      cnpj,
      nome: finalNome,
      razaoSocial: finalRazao,
      endereco,
      cep,
      municipio,
      uf,
      municipio_uf,
      telefone1,
      telefone2,
      email,
      cnaeCodigo: "62.01-5-01",
      cnae: "Desenvolvimento de programas de computador",
      cnaeDesc: "62.01-5-01 - Desenvolvimento de softwares",
      latLng,
      statusFunil: StatusFunil.SEM_CONTATO,
      dataUltimoContato: null,
      dataProximoContato: null,
      notasHistorico: []
    };
  });
}
import { 
  LayoutDashboard, Columns3, Database, Map, Bell, 
  RotateCcw, Sparkles, User, Clock, Building2, Plus
} from "lucide-react";

// Import custom components
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
import LeadsList from "./components/LeadsList";
import ProspectMap from "./components/ProspectMap";
import NotificationCenter from "./components/NotificationCenter";
import LeadModal from "./components/LeadModal";
import AddLeadModal from "./components/AddLeadModal";

const LOCAL_STORAGE_KEY = "b2b_crm_active_leads";

export default function App() {
  // 1. Core Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "kanban" | "list" | "map" | "alerts">("dashboard");
  
  // 2. Operational Live Time State
  const [currentTime, setCurrentTime] = useState<string>(new Date().toISOString());

  // 3. Load Leads from localStorage and/or fetch from Google Sheets on mount
  useEffect(() => {
    const loadLeads = async () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      let localLeads: Lead[] = [];
      if (saved) {
        try {
          localLeads = JSON.parse(saved);
        } catch (err) {
          console.error("Error reading leads from localStorage:", err);
        }
      }

      const csvUrl = "[LINK_CSV_PUBLICADO]";
      let sheetLeads: Lead[] = [];
      try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        sheetLeads = parseCSVToLeads(csvText);
      } catch (error) {
        console.warn("Failed to fetch Google Sheets CSV, using fallback data:", error);
        if (localLeads.length === 0) {
          sheetLeads = parseCSVToLeads(FALLBACK_CSV_DATA);
        }
      }

      if (sheetLeads.length > 0) {
        const mergedLeads = [...localLeads];
        for (const sheetLead of sheetLeads) {
          const exists = mergedLeads.some((l) => l.cnpj === sheetLead.cnpj);
          if (!exists) {
            mergedLeads.push(sheetLead);
          }
        }
        setLeads(mergedLeads);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedLeads));
      } else if (localLeads.length > 0) {
        setLeads(localLeads);
      } else {
        setLeads(INITIAL_LEADS);
      }
    };

    loadLeads();
  }, []);

  // 4. Save Leads state to localStorage whenever it changes
  const saveLeadsToStorage = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLeads));
  };

  // 5. Setup Live Operational Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 6. Action: Add a brand new Lead
  const handleAddLead = (newLead: Lead) => {
    const systemNote = {
      data: new Date().toISOString(),
      autor: "Sistema CRM",
      texto: `Prospect cadastrado na base comercial e colocado no estágio '${newLead.statusFunil}' por Tailan Fogaça.`
    };
    const leadWithNote = {
      ...newLead,
      notasHistorico: [systemNote]
    };
    const updatedLeads = [leadWithNote, ...leads];
    saveLeadsToStorage(updatedLeads);
  };

  // 7. Action: Update existing Lead details or append log entries
  const handleUpdateLead = (updatedLead: Lead) => {
    const updatedLeads = leads.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    saveLeadsToStorage(updatedLeads);
    // If the updated lead is currently active in detail modal, update modal view too
    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
  };

  // 8. Action: Move Lead Stage (Kanban Drag and Drop or arrows)
  const handleMoveLead = (leadId: string, newStage: StatusFunil) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (lead.statusFunil === newStage) return;

    const oldStage = lead.statusFunil;
    const systemNote = {
      data: new Date().toISOString(),
      autor: "Sistema CRM",
      texto: `Estágio do funil atualizado: de '${oldStage}' para '${newStage}'.`
    };

    const updatedLead: Lead = {
      ...lead,
      statusFunil: newStage,
      dataUltimoContato: new Date().toISOString(),
      notasHistorico: [systemNote, ...lead.notasHistorico]
    };

    const updatedLeads = leads.map((l) => (l.id === leadId ? updatedLead : l));
    saveLeadsToStorage(updatedLeads);
  };

  // 9. Reset database to premium demonstration dataset from sheet
  const handleResetToDemo = async () => {
    if (window.confirm("Deseja mesmo redefinir todos os dados comerciais para os leads da planilha do Google Sheets? Isso apagará suas alterações atuais.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      const csvUrl = "[LINK_CSV_PUBLICADO]";
      let sheetLeads: Lead[] = [];
      try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        sheetLeads = parseCSVToLeads(csvText);
      } catch (error) {
        console.warn("Failed to fetch Google Sheets CSV during reset, using fallback:", error);
        sheetLeads = parseCSVToLeads(FALLBACK_CSV_DATA);
      }
      
      if (sheetLeads.length > 0) {
        setLeads(sheetLeads);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sheetLeads));
      } else {
        setLeads(INITIAL_LEADS);
      }
      setSelectedLead(null);
      setActiveTab("dashboard");
    }
  };

  // 10. Calculate Alert counts for header tab badge
  const overdueAlertsCount = leads.filter((l) => {
    return getLeadStatus(l, currentTime) === "red";
  }).length;

  return (
    <div id="crm-app-root" className="flex h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-hidden antialiased">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0 border-r border-slate-900">
        {/* Brand identity */}
        <div className="p-6 border-b border-slate-900 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-sm font-display">D</div>
          <div>
            <span className="font-bold tracking-tight text-lg text-white font-display">Di Solle</span>
            <span className="block text-[8px] tracking-wider text-blue-400 font-bold uppercase mt-0.5">Prospecção Ativa</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 py-6 overflow-y-auto space-y-6">
          <div>
            <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Principal</div>
            <div className="space-y-1">
              {/* Dashboard Tab */}
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-semibold transition-colors cursor-pointer text-left border-l-4
                  ${activeTab === "dashboard" 
                    ? "bg-blue-600/15 border-blue-600 text-blue-400" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }
                `}
              >
                <LayoutDashboard size={15} />
                Painel Geral
              </button>

              {/* Kanban Tab */}
              <button
                id="tab-kanban"
                onClick={() => setActiveTab("kanban")}
                className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-semibold transition-colors cursor-pointer text-left border-l-4
                  ${activeTab === "kanban" 
                    ? "bg-blue-600/15 border-blue-600 text-blue-400" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }
                `}
              >
                <Columns3 size={15} />
                Funil Kanban
              </button>

              {/* Leads List Tab */}
              <button
                id="tab-list"
                onClick={() => setActiveTab("list")}
                className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-semibold transition-colors cursor-pointer text-left border-l-4
                  ${activeTab === "list" 
                    ? "bg-blue-600/15 border-blue-600 text-blue-400" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }
                `}
              >
                <Database size={15} />
                Leads B2B
              </button>

              {/* Geographic Map Tab */}
              <button
                id="tab-map"
                onClick={() => setActiveTab("map")}
                className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-semibold transition-colors cursor-pointer text-left border-l-4
                  ${activeTab === "map" 
                    ? "bg-blue-600/15 border-blue-600 text-blue-400" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }
                `}
              >
                <Map size={15} />
                Mapa de Prospecção
              </button>
            </div>
          </div>

          <div>
            <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Monitoramento</div>
            <div className="space-y-1">
              {/* Alerts Center Tab */}
              <button
                id="tab-alerts"
                onClick={() => setActiveTab("alerts")}
                className={`w-full flex items-center justify-between px-6 py-3 text-xs font-semibold transition-colors cursor-pointer text-left border-l-4
                  ${activeTab === "alerts" 
                    ? "bg-blue-600/15 border-blue-600 text-blue-400" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Bell size={15} className={overdueAlertsCount > 0 ? "text-rose-500 animate-bounce" : ""} />
                  <span>Central de Alertas</span>
                </div>
                {overdueAlertsCount > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {overdueAlertsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* SDR Profile Widget in Sidebar footer */}
        <div className="p-5 border-t border-slate-900 flex flex-col gap-2 shrink-0 bg-slate-950/45">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              TF
            </div>
            <div className="text-left leading-none">
              <p className="text-xs font-bold text-slate-200">Tailan Fogaça</p>
              <p className="text-[10px] text-blue-400 font-semibold mt-1">SDR Supervisor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shrink-0 text-slate-100">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Buscar por CNPJ, Nome ou Razão Social..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-800 text-slate-200 placeholder-slate-500 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                onClick={() => {
                  if (activeTab !== "list") setActiveTab("list");
                  const inputEl = document.getElementById("search-leads-input");
                  if (inputEl) inputEl.focus();
                }}
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Operational Clock */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono">
              <Clock size={13} className="text-slate-500" />
              <span>
                {new Date(currentTime).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}{" "}
                {new Date(currentTime).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </span>
            </div>

            {/* Reset Demo button */}
            <button
              onClick={handleResetToDemo}
              className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
              title="Redefinir banco de dados para demonstração"
            >
              <RotateCcw size={12} />
              Reset Demo
            </button>

            {/* Primary Add Lead Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} />
              Novo Lead
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 min-h-0 bg-slate-950">
          {activeTab === "dashboard" && (
            <Dashboard 
              leads={leads} 
              onSelectLead={setSelectedLead} 
              currentTime={currentTime} 
            />
          )}

          {activeTab === "kanban" && (
            <KanbanBoard 
              leads={leads} 
              onMoveLead={handleMoveLead} 
              onSelectLead={setSelectedLead} 
              currentTime={currentTime} 
            />
          )}

          {activeTab === "list" && (
            <LeadsList 
              leads={leads} 
              onSelectLead={setSelectedLead} 
              onOpenAddModal={() => setIsAddModalOpen(true)} 
              currentTime={currentTime} 
            />
          )}

          {activeTab === "map" && (
            <ProspectMap 
              leads={leads} 
              onSelectLead={setSelectedLead} 
              currentTime={currentTime} 
            />
          )}

          {activeTab === "alerts" && (
            <NotificationCenter 
              leads={leads} 
              onSelectLead={setSelectedLead} 
              currentTime={currentTime} 
            />
          )}
        </div>

        {/* Footer Branding Panel */}
        <footer className="bg-slate-900 border-t border-slate-800 py-3 text-center text-[10px] text-slate-500 font-mono shrink-0">
          Di Solle • Projetado para Outbound Calling • São Paulo - SP
        </footer>

      </main>

      {/* Operational Lead Detail Modal */}
      <LeadModal
        lead={selectedLead}
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        currentTime={currentTime}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddLead}
      />

    </div>
  );
}
