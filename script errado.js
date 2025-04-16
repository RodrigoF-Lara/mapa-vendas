let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';

// Dados das cidades dos RCs (COD_IBGE e nome do RC)
const cidadesRC = {
  '1400100': 'NABOR',
  '1504208': 'FABRÍCIO',
  '1505502': 'FABRÍCIO',
  '1721000': 'GABRIEL',
  '2101400': 'CLAUDEMIR',
  '2800308': 'ESCOURA',
  '2919553': 'PENINHA',
  '3170206': 'RENAN',
  '3529005': 'ANDRE',
  '4104808': 'ISRAEL',
  '4209003': 'WILIAN',
  '4301602': 'GUSTAVO',
  '4304705': 'LEANDRO TONET',
  '5003702': 'GRAZIAN',
  '5102637': 'RODRIGO',
  '5105259': 'JOAO',
  '5107040': 'GLESON',
  '5208707': 'RENNAN'
};

// Ícone personalizado para os RCs
const rcIcon = L.divIcon({
  className: 'rc-marker',
  iconSize: [12, 20],
  iconAnchor: [6, 20],
  popupAnchor: [0, -20]
});

// Inicializa o mapa
function initMap() {
  map = L.map('map').setView([-30.0346, -51.2177], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

// Carrega os dados da Google Sheets API
function carregarDadosAPI() {
  const sheetId = '1a-yRMDydBgb5vrAmrl7eSktpXn7Er66-D4wUvPJc5FA';
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
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

// Carrega o GeoJSON com os limites dos municípios
function carregarGeoJSON() {
  fetch('municipios-RS.geojson')
    .then(response => response.json())
    .then(geojson => {
      L.geoJSON(geojson, {
        // Função para configurar as camadas do GeoJSON
        onEachFeature: function (feature, layer) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          // Verifica se é uma cidade de RC
          const rc = cidadesRC[codigoIBGE];

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            const cor = totalQnt > 0 ? 'yellow' : 'gray';

            layer.setStyle({
              fillColor: cor,
              fillOpacity: 0.5,
              weight: 1,
              color: 'black'
            });

            const nomeCidade = feature.properties.NM_MUN || 'Cidade desconhecida';
            let popupContent = `<strong>${nomeCidade}</strong><br>Total QNT: ${totalQnt}`;
            
            // Adiciona info do RC se for uma cidade de RC
            if (rc) {
              popupContent += `<br><strong>RC:</strong> ${rc}`;
              
              // Adiciona marcador no centro do município
              const centroid = turf.centroid(feature).geometry.coordinates;
              L.marker([centroid[1], centroid[0]], {icon: rcIcon})
                .bindPopup(`<strong>${nomeCidade}</strong><br><strong>RC:</strong> ${rc}`)
                .addTo(map);
            }

            layer.bindPopup(popupContent);

            layer.on('click', () => {
              mostrarTabela(codigoIBGE);
            });
          } else if (rc) {
            // Mostra marcador mesmo sem vendas se for cidade de RC
            const nomeCidade = feature.properties.NM_MUN || 'Cidade desconhecida';
            const centroid = turf.centroid(feature).geometry.coordinates;
            L.marker([centroid[1], centroid[0]], {icon: rcIcon})
              .bindPopup(`<strong>${nomeCidade}</strong><br><strong>RC:</strong> ${rc}`)
              .addTo(map);
          } else {
            layer.setStyle({
              fillColor: 'gray',
              fillOpacity: 0.3,
              weight: 1,
              color: 'black'
            });
          }
        }
      }).addTo(map);
    })
    .catch(error => console.error('Erro ao carregar GeoJSON:', error));
}

// O restante do código para filtros, tabela, etc., permanece o mesmo

document.addEventListener('DOMContentLoaded', function () {
  carregarTurfJS(); // Carrega Turf.js e inicializa a aplicação
});
