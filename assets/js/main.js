import { carregarDadosAPI } from './api.js';
import { initMap, addTileLayer, addMarkersToMap } from './map.js';
import { gerarGraficoMensal } from './chart.js';
import { mostrarTabela } from './table.js';
import { gerarPDF } from './pdf.js';

let dadosCSV = [];
let regiaoAtual = null;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';

// Função para carregar a região e mostrar o mapa correspondente
function carregarRegiao(regiaoId) {
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;
  regiaoAtual = configuracoesRegioes[regiaoId];
  
  // Destruir o mapa existente
  if (map) {
    map.remove();
  }

  // Criar novo mapa
  initMap();
  carregarDadosAPI(regiaoAtual.planilhaId, 'AIzaSyAOPTDOnQXBBPj_hp0zzLBDL90KdV8Dzu0');
}

document.getElementById('gerar-pdf').addEventListener('click', () => {
  gerarPDF(configuracoesRegioes, dadosCSV);
});
