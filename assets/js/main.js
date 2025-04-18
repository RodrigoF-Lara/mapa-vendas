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

