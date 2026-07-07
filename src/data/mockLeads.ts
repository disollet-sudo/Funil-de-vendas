import { Lead, StatusFunil } from "../types";

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-1",
    cnpj: "12.345.678/0001-90",
    nome: "Tech Soluções de TI",
    razaoSocial: "Tech Soluções em Informática e Automação Ltda",
    endereco: "Av. Paulista, 1000 - Bela Vista",
    cep: "01310-100",
    municipio: "São Paulo",
    uf: "SP",
    municipio_uf: "São Paulo - SP",
    telefone1: "11987654321",
    telefone2: "1132540987",
    email: "contato@techsolucoes.com.br",
    cnaeCodigo: "62.01-5-01",
    cnae: "Desenvolvimento de programas de computador sob encomenda",
    cnaeDesc: "62.01-5-01 - Desenvolvimento de softwares customizados para automação comercial",
    latLng: { lat: -23.5631, lng: -46.6544 }, // Paulista Ave
    statusFunil: StatusFunil.SEM_CONTATO,
    dataUltimoContato: null,
    dataProximoContato: "2026-07-06T10:00:00", // Scheduled for TODAY
    notasHistorico: []
  },
  {
    id: "lead-2",
    cnpj: "98.765.432/0001-10",
    nome: "Metalúrgica Força Forte",
    razaoSocial: "Força Forte Metalurgia e Usinagem Industrial Eireli",
    endereco: "Rua Industrial, 450 - Distrito Industrial",
    cep: "13054-700",
    municipio: "Campinas",
    uf: "SP",
    municipio_uf: "Campinas - SP",
    telefone1: "19974012345",
    telefone2: "1937224400",
    email: "comercial@metalurgicaforcaforte.com",
    cnaeCodigo: "25.39-0-01",
    cnae: "Serviços de usinagem, tornearia e solda",
    cnaeDesc: "25.39-0-01 - Serviços especializados de metalurgia e caldeiraria pesada",
    latLng: { lat: -22.9064, lng: -47.0616 },
    statusFunil: StatusFunil.TENTATIVA_CONTATO,
    dataUltimoContato: "2026-07-03T15:30:00",
    dataProximoContato: "2026-07-05T09:00:00", // OVERDUE (Yesterday)
    notasHistorico: [
      {
        data: "2026-07-03T15:30:00",
        autor: "Tailan Fogaça",
        texto: "Liguei no telefone principal, a secretária informou que o Diretor de Operações (Sr. Marcos) estava em reunião. Enviei apresentação por e-mail e agendei follow-up."
      }
    ]
  },
  {
    id: "lead-3",
    cnpj: "45.888.123/0001-44",
    nome: "Logística Expressa Brasil",
    razaoSocial: "LEB Transportes e Distribuição de Cargas S/A",
    endereco: "Av. Brasil, 15300 - Parada de Lucas",
    cep: "21012-351",
    municipio: "Rio de Janeiro",
    uf: "RJ",
    municipio_uf: "Rio de Janeiro - RJ",
    telefone1: "21965432109",
    telefone2: "2125843322",
    email: "suprimentos@logisticaexpressa.com.br",
    cnaeCodigo: "49.30-2-02",
    cnae: "Transporte rodoviário de carga, exceto produtos perigosos",
    cnaeDesc: "49.30-2-02 - Transporte intermunicipal e interestadual de mercadorias",
    latLng: { lat: -22.8252, lng: -43.2981 },
    statusFunil: StatusFunil.CONTATO_ESTABELECIDO,
    dataUltimoContato: "2026-07-05T14:00:00",
    dataProximoContato: "2026-07-06T14:30:00", // Scheduled for TODAY (Soon)
    notasHistorico: [
      {
        data: "2026-07-05T14:00:00",
        autor: "Tailan Fogaça",
        texto: "Consegui falar diretamente com a Gerente de TI (Juliana). Ela demonstrou grande interesse no nosso sistema de roteirização. Solicitou uma demonstração ao vivo para a equipe hoje às 14:30."
      }
    ]
  },
  {
    id: "lead-4",
    cnpj: "33.222.111/0001-00",
    nome: "Supermercados Compre Bem",
    razaoSocial: "Compre Bem Distribuidora de Alimentos S/A",
    endereco: "Rua das Flores, 1200 - Centro",
    cep: "30110-010",
    municipio: "Belo Horizonte",
    uf: "MG",
    municipio_uf: "Belo Horizonte - MG",
    telefone1: "31988887777",
    telefone2: "3132124545",
    email: "compras@comprebenmg.com",
    cnaeCodigo: "47.11-3-02",
    cnae: "Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados",
    cnaeDesc: "47.11-3-02 - Supermercados de grande porte e hipermercados regionais",
    latLng: { lat: -19.9213, lng: -43.9375 },
    statusFunil: StatusFunil.PROPOSTA_ENVIADA,
    dataUltimoContato: "2026-07-02T11:00:00",
    dataProximoContato: "2026-07-09T10:00:00", // Future date
    notasHistorico: [
      {
        data: "2026-07-02T11:00:00",
        autor: "Tailan Fogaça",
        texto: "Apresentamos a proposta comercial de R$ 4.500/mês + setup. O Diretor Financeiro (Roberto) ficou de avaliar com a diretoria técnica e nos dar retorno até a próxima semana."
      },
      {
        data: "2026-06-29T10:15:00",
        autor: "Tailan Fogaça",
        texto: "Reunião de diagnóstico realizada por vídeo. Mapeamos que possuem 5 filiais precisando de integração imediata de estoque."
      }
    ]
  },
  {
    id: "lead-5",
    cnpj: "55.666.777/0001-88",
    nome: "Alimentos Sul Sabor",
    razaoSocial: "Sul Sabor Indústria Alimentícia Ltda",
    endereco: "Av. Ipiranga, 4500 - Praia de Belas",
    cep: "90160-091",
    municipio: "Porto Alegre",
    uf: "RS",
    municipio_uf: "Porto Alegre - RS",
    telefone1: "51999887766",
    telefone2: "5133221100",
    email: "diretoria@sulsabor.com.br",
    cnaeCodigo: "10.99-6-99",
    cnae: "Fabricação de outros produtos alimentícios não especificados anteriormente",
    cnaeDesc: "10.99-6-99 - Industrialização de pratos prontos congelados e massas frescas",
    latLng: { lat: -30.0436, lng: -51.2117 },
    statusFunil: StatusFunil.CLIENTE_GANHO,
    dataUltimoContato: "2026-07-01T16:00:00",
    dataProximoContato: null, // No follow-up needed for won customer
    notasHistorico: [
      {
        data: "2026-07-01T16:00:00",
        autor: "Tailan Fogaça",
        texto: "Contrato assinado! Setup de implantação agendado com a equipe de onboarding do cliente."
      },
      {
        data: "2026-06-25T14:00:00",
        autor: "Tailan Fogaça",
        texto: "Proposta aceita! Enviamos a minuta contratual para o jurídico do cliente analisar."
      }
    ]
  },
  {
    id: "lead-6",
    cnpj: "66.555.444/0001-22",
    nome: "Indústria Têxtil Catarinense",
    razaoSocial: "ITC Têxtil e Fiação S/A",
    endereco: "Rua XV de Novembro, 2300 - Centro",
    cep: "89010-000",
    municipio: "Blumenau",
    uf: "SC",
    municipio_uf: "Blumenau - SC",
    telefone1: "47988776655",
    telefone2: "4733215500",
    email: "compras@itctextil.com.br",
    cnaeCodigo: "13.21-9-00",
    cnae: "Tecelagem de fios de algodão",
    cnaeDesc: "13.21-9-00 - Tecelagem industrial de malhas e tecidos técnicos sob demanda",
    latLng: { lat: -26.9192, lng: -49.0661 },
    statusFunil: StatusFunil.PERDIDO,
    dataUltimoContato: "2026-06-20T14:00:00",
    dataProximoContato: null,
    notasHistorico: [
      {
        data: "2026-06-20T14:00:00",
        autor: "Tailan Fogaça",
        texto: "Lead descartado. Acabaram de fechar contrato de 3 anos com um concorrente local que cobriu qualquer oferta de preço."
      }
    ]
  },
  {
    id: "lead-7",
    cnpj: "77.888.999/0001-11",
    nome: "Construtora Pinheiro S/A",
    razaoSocial: "Pinheiro Incorporações e Engenharia Civil S/A",
    endereco: "Av. Batel, 1500 - Batel",
    cep: "80420-090",
    municipio: "Curitiba",
    uf: "PR",
    municipio_uf: "Curitiba - PR",
    telefone1: "41991234567",
    telefone2: "4130245000",
    email: "novosnegocios@pinheiroeng.com.br",
    cnaeCodigo: "41.20-4-00",
    cnae: "Construção de edifícios",
    cnaeDesc: "41.20-4-00 - Incorporação e execução de obras residenciais de alto padrão",
    latLng: { lat: -25.4435, lng: -49.2847 },
    statusFunil: StatusFunil.SEM_CONTATO,
    dataUltimoContato: null,
    dataProximoContato: null, // No contact scheduled yet
    notasHistorico: []
  },
  {
    id: "lead-8",
    cnpj: "88.999.000/0001-22",
    nome: "Distribuidora de Bebidas Central",
    razaoSocial: "Central Distribuidora de Bebidas e Logística Ltda",
    endereco: "Rua do Comércio, 120 - Área Industrial",
    cep: "88103-000",
    municipio: "São José",
    uf: "SC",
    municipio_uf: "São José - SC",
    telefone1: "48999123490",
    telefone2: "4832410988",
    email: "contato@bebidacentral.com.br",
    cnaeCodigo: "46.35-4-02",
    cnae: "Comércio atacadista de cerveja, chope e refrigerante",
    cnaeDesc: "46.35-4-02 - Distribuição em grande escala para supermercados e bares",
    latLng: { lat: -27.6134, lng: -48.6253 },
    statusFunil: StatusFunil.TENTATIVA_CONTATO,
    dataUltimoContato: "2026-07-06T08:00:00",
    dataProximoContato: "2026-07-06T06:00:00", // OVERDUE (Today, but earlier than current 4:46? No, actually, if it's 2026-07-06T06:00:00, that is upcoming or overdue shortly. Let's make it 2026-07-06T02:00:00, which is OVERDUE TODAY)
    notasHistorico: [
      {
        data: "2026-07-06T02:00:00",
        autor: "Tailan Fogaça",
        texto: "Tentei contato via WhatsApp no número do celular, mensagem foi entregue mas não lida. Vou tentar ligação direta mais tarde."
      }
    ]
  }
];
