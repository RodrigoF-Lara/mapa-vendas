// Variáveis para armazenar dados das rotas planejadas
let dadosRotasPlanejadas = [];
let marcadoresRotasPlanejadas = [];

// ID da planilha do Google Sheets com as rotas planejadas
const rotasPlanejadas_sheetId = '1veYXK8VAo0aydKe2a1zRnENADBRjCXQx-GlX9Uy6r-0';
const apiKey = 'AIzaSyAOPTDOnQXBBPj_hp0zzLBDL90KdV8Dzu0';

// Função para carregar os dados das rotas planejadas
function carregarDadosRotasPlanejadas() {
  if (!regiaoAtual) return;
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${rotasPlanejadas_sheetId}/values/A1:D1000?key=${apiKey}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.values) {
        console.log('Dados das rotas planejadas:', data.values);
        const headers = data.values[0];
        
        // Converter os dados para um formato mais fácil de usar
        dadosRotasPlanejadas = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
        
        // Filtrar apenas as rotas da região atual
        dadosRotasPlanejadas = dadosRotasPlanejadas.filter(rota => 
          rota.REGIÃO === regiaoAtual.nome.substring(0, 2) // Assumindo que a região na planilha é apenas a sigla do estado
        );
        
        console.log('Rotas planejadas filtradas para a região atual:', dadosRotasPlanejadas);
        
        // Se o checkbox estiver marcado, mostrar os marcadores
        if (mostrarRotasPlanejadas) {
          mostrarMarcadoresRotasPlanejadas();
        }
      } else {
        console.error('Nenhum dado encontrado na planilha de rotas planejadas.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados das rotas planejadas:', error));
}

// Função para mostrar os marcadores das rotas planejadas
function mostrarMarcadoresRotasPlanejadas() {
  // Limpar marcadores existentes
  limparMarcadoresRotasPlanejadas();
  
  if (!map || !dadosRotasPlanejadas.length) return;
  
  console.log('Mostrando marcadores para rotas planejadas');
  
  // Criar um ícone personalizado para as rotas planejadas
  const rotaIcon = L.divIcon({
    className: 'marcador-rota-planejada',
    html: '<div class="marcador-rota-planejada-icon">R</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  // Para cada cidade nas rotas planejadas, encontrar o feature correspondente no GeoJSON e adicionar um marcador
  dadosRotasPlanejadas.forEach(rota => {
    const codigoIBGE = rota.COD_IBGE;
    
    // Buscar no GeoJSON a cidade correspondente
    fetch(regiaoAtual.geojsonPath)
      .then(response => response.json())
      .then(geojson => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        
        if (feature) {
          // Calcular o centroide da cidade
          const centroid = turf.centroid(feature).geometry.coordinates;
          
          // Criar o popup com informações da rota
          const popupContent = `
            <strong>${feature.properties.NM_MUN}</strong><br>
            <strong>🚗 Rota:</strong> ${rota.ROTA}<br>
            <strong>🏙️ Região:</strong> ${rota.REGIÃO}<br>
          `;
          
          // Adicionar o marcador ao mapa
          const marker = L.marker([centroid[1], centroid[0]], { 
            icon: rotaIcon,
            zIndexOffset: 1000 // Para garantir que fique acima de outros marcadores
          })
            .bindPopup(popupContent)
            .addTo(map);
          
          // Armazenar o marcador para poder removê-lo depois
          marcadoresRotasPlanejadas.push(marker);
        }
      })
      .catch(error => {
        console.error('Falha ao carregar GeoJSON para rotas planejadas:', error);
      });
  });
}

// Função para limpar os marcadores das rotas planejadas
function limparMarcadoresRotasPlanejadas() {
  marcadoresRotasPlanejadas.forEach(marker => {
    if (map) map.removeLayer(marker);
  });
  marcadoresRotasPlanejadas = [];
}

// Função para alternar a exibição das rotas planejadas
function toggleRotasPlanejadas() {
  mostrarRotasPlanejadas = document.getElementById('rotas-planejadas').checked;
  
  if (mostrarRotasPlanejadas) {
    mostrarMarcadoresRotasPlanejadas();
  } else {
    limparMarcadoresRotasPlanejadas();
  }
}
