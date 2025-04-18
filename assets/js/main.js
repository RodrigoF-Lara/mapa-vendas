import { carregarDadosAPI } from './api.js';
import { initMap, addTileLayer } from './map.js';

// Inicializar o mapa com parâmetros necessários
function carregarRegiao(regiaoId) {
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;

  regiaoAtual = configuracoesRegioes[regiaoId];

  // Destruir o mapa existente antes de criar um novo
  if (map) {
    map.remove();
  }

  // Inicializar o mapa com os parâmetros corretos
  map = initMap('map', regiaoAtual.view, regiaoAtual.zoom);
  addTileLayer(map);

  // Carregar os dados da API para a região
  carregarDadosAPI(regiaoAtual.planilhaId, 'AIzaSyAOPTDOnQXBBPj_hp0zzLBDL90KdV8Dzu0');
}
import { carregarGeoJSON } from './map.js';

// Função para carregar dados e exibir no mapa
function carregarDadosNoMapa() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada.');
    return;
  }

  // Configurar o caminho do GeoJSON e carregar no mapa
  const geojsonPath = regiaoAtual.geojsonPath;
  const cidadesRC = regiaoAtual.cidadesRC;

  const rcIcon = L.divIcon({
    className: 'rc-marker',
    iconSize: [32, 20],
    iconAnchor: [6, 20],
    popupAnchor: [0, -20],
  });

  carregarGeoJSON(map, geojsonPath, cidadesRC, rcIcon);
}

// Atualizar a função carregarRegiao para incluir o carregamento de dados no mapa
function carregarRegiao(regiaoId) {
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;

  regiaoAtual = configuracoesRegioes[regiaoId];

  if (map) {
    map.remove();
  }

  map = initMap('map', regiaoAtual.view, regiaoAtual.zoom);
  addTileLayer(map);

  // Após inicializar o mapa, carregar os dados nele
  carregarDadosAPI(regiaoAtual.planilhaId, 'SUA_CHAVE_DE_API_AQUI', dados => {
    dadosCSV = dados; // Atualizar a variável global com os dados carregados
    carregarDadosNoMapa();
  });
}
