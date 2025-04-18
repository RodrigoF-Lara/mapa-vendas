// Inicialização do mapa e dados
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
  // Configuração inicial de visualização do mapa (padrão)
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

// Função para carregar o GeoJSON com os limites dos municípios
function carregarGeoJSON() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  // Codifica o caminho para lidar com espaços e caracteres especiais no nome do arquivo
  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);

  // Carrega o GeoJSON da região
  fetch(caminhoGeoJSON)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Criação dos marcadores no mapa para cada cidade
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], { icon: rcIcon })
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Adiciona o GeoJSON no mapa com o estilo e funcionalidades de interatividade
      L.geoJSON(geojson, {
        style: function(feature) {
          return {
            fillColor: 'gray',  // Cor de preenchimento dos limites
            fillOpacity: 0.3,   // Opacidade do preenchimento
            weight: 1,          // Espessura da borda
            color: 'black'      // Cor da borda
          };
        },
        onEachFeature: function(feature, layer) {
          // Filtra os dados de vendas para cada município
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);

            // Altera o estilo do município com base nos dados
            layer.setStyle({
              fillColor: totalQnt > 0 ? '#ffeb3b' : '#9e9e9e',  // Amarelo se houver vendas
              fillOpacity: 0.7
            });

            // Exibe informações sobre o município e as vendas
            layer.bindPopup(`<div class="map-popup">
              <h4>${feature.properties.NM_MUN}</h4>
              <p>Quantidade: ${totalQnt}</p>
              ${regiaoAtual.cidadesRC[codigoIBGE] ? `<p>RC: ${regiaoAtual.cidadesRC[codigoIBGE]}</p>` : ''}
            </div>`);
          }
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
      console.error('Caminho tentado:', regiaoAtual.geojsonPath);
    });
}
