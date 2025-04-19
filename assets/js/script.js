let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';
let regiaoAtual = null;

// Ícone personalizado para os RCs
const rcIcon = L.divIcon({
  className: 'rc-marker',
  iconSize: [32, 20],
  iconAnchor: [6, 20],
  popupAnchor: [0, -20]
});

// Inicializa o mapa
function initMap() {
  const config = regiaoAtual || {
    view: [-30.0346, -51.2177],
    zoom: 6
  };
  
  map = L.map('map').setView(config.view, config.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// Função para carregar a região selecionada
function carregarRegiao(regiaoId) {
  console.log('Carregando região:', regiaoId);
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;
  
  regiaoAtual = configuracoesRegioes[regiaoId];
  
  // Destruir o mapa existente
  if (map) {
    map.remove();
  }
  
  // Reiniciar variáveis
  dadosCSV = [];
  filtroAnoSelecionado = '';
  filtroMesSelecionado = 'todos';
  
  // Criar novo mapa
  initMap();
  carregarDadosAPI();
}

// Carrega os dados da Google Sheets API
function carregarDadosAPI() {
  if (!regiaoAtual) return;
  
  const sheetId = regiaoAtual.planilhaId;
  const apiKey = 'AIzaSyAOPTDOnQXBBPj_hp0zzLBDL90KdV8Dzu0';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.values) {
        const headers = data.values[0];
        dadosCSV = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
        popularFiltros();
        carregarGeoJSON();
        mostrarResumoEstado();
        gerarGraficoMensal();
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

// Função para carregar o GeoJSON
function carregarGeoJSON() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);
  
  fetch(caminhoGeoJSON)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Criar todos os marcadores dos RCs específicos da região
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], { icon: rcIcon })
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Adiciona os limites no mapa
      L.geoJSON(geojson, {
        style: function(feature) {
          return {
            fillColor: 'gray',
            fillOpacity: 0.3,
            weight: 1,
            color: 'black'
          };
        },
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
    });
}
