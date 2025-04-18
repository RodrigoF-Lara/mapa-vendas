let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';
let regiaoAtual = null;

// Ícone personalizado para os RCs (Responsáveis de Cidades)
const rcIcon = L.divIcon({
  className: 'rc-marker',
  iconSize: [32, 20],
  iconAnchor: [6, 20],
  popupAnchor: [0, -20]
});

// Função para inicializar o mapa
function initMap() {
  const config = regiaoAtual || {
    view: [-30.0346, -51.2177],  // Posição padrão para o estado de RS
    zoom: 6  // Zoom inicial
  };

  // Inicializa o mapa com a visão e zoom definidos
  map = L.map('map').setView(config.view, config.zoom);

  // Adiciona o layer de tiles do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// Função para carregar a região selecionada
function carregarRegiao(regiaoId) {
  console.log('Carregando região:', regiaoId);
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;
  
  regiaoAtual = configuracoesRegioes[regiaoId];
  
  // Destruir o mapa existente antes de criar um novo
  if (map) {
    map.remove();
  }
  
  // Reiniciar as variáveis
  dadosCSV = [];
  filtroAnoSelecionado = '';
  filtroMesSelecionado = 'todos';
  
  // Criar novo mapa com as configurações da região
  initMap();
  carregarDadosAPI();  // Carregar os dados da API do Google Sheets
}
