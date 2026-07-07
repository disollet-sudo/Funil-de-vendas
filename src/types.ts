export enum StatusFunil {
  SEM_CONTATO = "Sem Contato",
  TENTATIVA_CONTATO = "Tentativa de Contato",
  CONTATO_ESTABELECIDO = "Contato Estabelecido",
  PROPOSTA_ENVIADA = "Proposta Enviada",
  CLIENTE_GANHO = "Cliente Ganho",
  PERDIDO = "Perdido / Sem Interesse"
}

export interface NotaHistorico {
  data: string; // ISO DateTime string
  autor: string;
  texto: string;
}

export interface Lead {
  id: string; // Unique Identifier
  cnpj: string;
  nome: string;
  razaoSocial: string;
  endereco: string;
  cep: string;
  municipio: string;
  uf: string;
  municipio_uf: string; // "Município - UF" format
  telefone1: string;
  telefone2: string;
  email: string;
  cnaeCodigo: string;
  cnae: string;
  cnaeDesc: string;
  latLng: {
    lat: number;
    lng: number;
  };
  statusFunil: StatusFunil;
  dataUltimoContato: string | null; // ISO DateTime string
  dataProximoContato: string | null; // ISO DateTime string
  notasHistorico: NotaHistorico[];
}

export interface DashboardMetrics {
  totalLeads: number;
  contatadosHoje: number;
  agendadosHoje: number;
  leadsAtrasados: number;
  taxaConversao: number; // percentage
}
