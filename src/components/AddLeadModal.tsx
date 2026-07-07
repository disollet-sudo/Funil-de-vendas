import React, { useState, useEffect } from "react";
import { Lead, StatusFunil } from "../types";
import { X, Plus, Info, MapPin, Building, Phone, Mail, FileText } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (newLead: Lead) => void;
}

// Brazilian State Capital Coordinates for intelligent automated geocoding
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

export default function AddLeadModal({ isOpen, onClose, onAddLead }: AddLeadModalProps) {
  if (!isOpen) return null;

  const [cnpj, setCnpj] = useState("");
  const [nome, setNome] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState("SP");
  const [telefone1, setTelefone1] = useState("");
  const [telefone2, setTelefone2] = useState("");
  const [email, setEmail] = useState("");
  const [cnaeCodigo, setCnaeCodigo] = useState("");
  const [cnae, setCnae] = useState("");
  const [cnaeDesc, setCnaeDesc] = useState("");
  const [statusFunil, setStatusFunil] = useState<StatusFunil>(StatusFunil.SEM_CONTATO);

  // Automatically sync Razao Social or CNAE descriptions for easier user entry
  useEffect(() => {
    if (nome && !razaoSocial) {
      setRazaoSocial(`${nome} Ltda`);
    }
  }, [nome]);

  useEffect(() => {
    if (cnaeCodigo && cnae && !cnaeDesc) {
      setCnaeDesc(`${cnaeCodigo} - ${cnae}`);
    }
  }, [cnaeCodigo, cnae]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Smart coordinates generator: Use state capital with small randomized variance to avoid overlap
    const capitalInfo = CAPITAL_COORDINATES[uf] || CAPITAL_COORDINATES["SP"];
    const randomOffsetLat = (Math.random() - 0.5) * 0.15; // randomized slightly
    const randomOffsetLng = (Math.random() - 0.5) * 0.15;

    const latLng = {
      lat: capitalInfo.lat + randomOffsetLat,
      lng: capitalInfo.lng + randomOffsetLng
    };

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      cnpj: cnpj.trim(),
      nome: nome.trim(),
      razaoSocial: razaoSocial.trim() || `${nome.trim()} Ltda`,
      endereco: endereco.trim(),
      cep: cep.trim(),
      municipio: municipio.trim(),
      uf,
      municipio_uf: `${municipio.trim()} - ${uf}`,
      telefone1: telefone1.trim(),
      telefone2: telefone2.trim() || "",
      email: email.trim(),
      cnaeCodigo: cnaeCodigo.trim(),
      cnae: cnae.trim(),
      cnaeDesc: cnaeDesc.trim() || `${cnaeCodigo.trim()} - ${cnae.trim()}`,
      latLng,
      statusFunil,
      dataUltimoContato: null,
      dataProximoContato: null,
      notasHistorico: []
    };

    onAddLead(newLead);
    
    // Reset all
    setCnpj("");
    setNome("");
    setRazaoSocial("");
    setEndereco("");
    setCep("");
    setMunicipio("");
    setUf("SP");
    setTelefone1("");
    setTelefone2("");
    setEmail("");
    setCnaeCodigo("");
    setCnae("");
    setCnaeDesc("");
    setStatusFunil(StatusFunil.SEM_CONTATO);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="add-lead-modal"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/15 text-blue-400 border border-blue-900/30 rounded-lg">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Adicionar Novo Prospect Comercial</h2>
              <p className="text-xs text-slate-400">Insira as informações cadastrais para iniciar a prospecção ativa B2B.</p>
            </div>
          </div>
          <button 
            id="close-add-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Corporate ID */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <Building size={14} />
              Identificação Empresarial
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  CNPJ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all font-mono placeholder:text-slate-600"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Nome Fantasia <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tech Soluções"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all font-semibold placeholder:text-slate-600"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Razão Social <span className="text-slate-500">(Auto-completa)</span>
                </label>
                <input
                  type="text"
                  placeholder="Tech Soluções de TI Ltda"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} />
              Canais de Contato e Vendas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Telefone 1 (Principal/WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="11987654321 (apenas números)"
                  value={telefone1}
                  onChange={(e) => setTelefone1(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Telefone 2 (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="1134560099"
                  value={telefone2}
                  onChange={(e) => setTelefone2(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  E-mail do Decisor <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="compras@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Geographics (Address) */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} />
              Geolocalização e Logradouro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Endereço Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Av. Paulista, 1000 - Conjunto 15"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  CEP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="01310-100"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all font-mono placeholder:text-slate-600"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Município <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="São Paulo"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  UF <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all"
                >
                  {Object.keys(CAPITAL_COORDINATES).map((state) => (
                    <option key={state} value={state} className="bg-slate-950 text-slate-100">
                      {state}
                    </option>
                  ))}
                  {/* Append other states */}
                  {["AC", "AL", "AP", "AM", "ES", "MA", "MT", "MS", "PA", "PB", "PE", "PI", "RJ", "RN", "RO", "RR", "SE", "TO"].filter(s => !CAPITAL_COORDINATES[s]).map(s => (
                    <option key={s} value={s} className="bg-slate-950 text-slate-100">{s}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-2 items-start text-xs text-amber-300">
              <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
              <p>
                <strong>Geolocalização Automática:</strong> O sistema identificará o estado (UF: <strong>{uf}</strong>) e gerará automaticamente as coordenadas geográficas corretas no mapa de densidade de prospecção.
              </p>
            </div>
          </div>

          {/* Section 4: Segment (CNAE) & Funnel Status */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} />
              Segmentação Setorial e Funil
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Código do CNAE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="62.01-5-01"
                  value={cnaeCodigo}
                  onChange={(e) => setCnaeCodigo(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all font-mono placeholder:text-slate-600"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Atividade Econômica (CNAE) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Desenvolvimento de softwares sob encomenda"
                  value={cnae}
                  onChange={(e) => setCnae(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  Estágio Inicial do Funil
                </label>
                <select
                  value={statusFunil}
                  onChange={(e) => setStatusFunil(e.target.value as StatusFunil)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all font-semibold"
                >
                  {Object.values(StatusFunil).map((status) => (
                    <option key={status} value={status} className="bg-slate-950 text-slate-100">
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-12">
                <label className="block text-xs font-medium text-slate-350 mb-1">
                  CNAE Descrição Detalhada <span className="text-slate-500">(Auto-completa)</span>
                </label>
                <input
                  type="text"
                  placeholder="62.01-5-01 - Desenvolvimento de softwares e aplicativos sob encomenda para varejistas"
                  value={cnaeDesc}
                  onChange={(e) => setCnaeDesc(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-950/50 rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Footer inside scrolling container, but let's push buttons here */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 shrink-0">
            <button
              id="btn-cancel-add"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-450 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-add"
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Adicionar Leads ao Funil
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
