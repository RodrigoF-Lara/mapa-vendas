// Variáveis para armazenar dados das rotas planejadas
let dadosRotasPlanejadas = [];
let marcadoresRotasPlanejadas = [];
let contornosRotasPlanejadas = []; // Nova variável para armazenar os contornos das cidades
let filtroRotaSelecionada = 'todas'; // Nova variável para armazenar a rota selecionada no filtro

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
          rota.REGIÃO === regiaoAtual.nome // Comparação exata com o nome da região
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
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
  
  // Filtrar as rotas com base na seleção do dropdown
  const rotasFiltradas = filtroRotaSelecionada === 'todas' 
    ? dadosRotasPlanejadas 
    : dadosRotasPlanejadas.filter(rota => rota.ROTA === `Rota ${filtroRotaSelecionada}`);
  
  //console.log(`Rotas filtradas (${filtroRotaSelecionada}):`, rotasFiltradas);
  //console.log("Rotas filtradas:", rotasFiltradas);
  
  // Para cada cidade nas rotas planejadas filtradas, encontrar o feature correspondente no GeoJSON e adicionar um marcador
  rotasFiltradas.forEach(rota => {
    const codigoIBGE = rota.COD_IBGE;
    
    // Buscar no GeoJSON a cidade correspondente
    fetch(regiaoAtual.geojsonPath)
      .then(response => response.json())
      .then(geojson => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        
        if (!feature) {
          console.warn('Cidade não encontrada no GeoJSON:', rota.MUNICIPIO, 'COD_IBGE:', codigoIBGE);
        }
        
        if (feature && feature.geometry && feature.geometry.coordinates) {
          try {
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
        
            // Adicionar contorno preto à cidade
            const contorno = L.geoJSON(feature, {
              style: {
                color: '#000000', // Cor preta para o contorno
                weight: 3, // Espessura da linha
                opacity: 1, // Opacidade total
                fillColor: '#ff5722', // Cor de preenchimento laranja
                fillOpacity: 0.1, // Preenchimento quase transparente
                dashArray: '5, 5' // Linha tracejada para destacar
              }
            }).addTo(map);
        
            // Adicionar o mesmo popup ao contorno
            contorno.bindPopup(popupContent);
        
            // Armazenar o contorno para poder removê-lo depois
            contornosRotasPlanejadas.push(contorno);
          } catch (error) {
            console.warn('Erro ao processar a rota:', rota.MUNICIPIO, 'COD_IBGE:', rota.COD_IBGE); // Adicionado aqui
            console.error('Feature inválida ou sem coordenadas:', feature);

          }
        } else {
          console.log("Rotas filtradas:", rotasFiltradas);
          console.error('Feature inválida ou sem coordenadas:', feature);
        }
      })
      .catch(error => {
        console.log("Rotas filtradas:", rotasFiltradas);
        console.error('Falha ao carregar GeoJSON para rotas planejadas:', error);
      });
  });
}

// Função para limpar os marcadores das rotas planejadas
function limparMarcadoresRotasPlanejadas() {
  // Remover marcadores
  marcadoresRotasPlanejadas.forEach(marker => {
    if (map) map.removeLayer(marker);
  });
  marcadoresRotasPlanejadas = [];
  
  // Remover contornos
  contornosRotasPlanejadas.forEach(contorno => {
    if (map) map.removeLayer(contorno);
  });
  contornosRotasPlanejadas = [];
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

// Função para filtrar rotas com base na seleção do dropdown
function filtrarRotas() {
  filtroRotaSelecionada = document.getElementById('filtro-rota').value;
  
  // Se as rotas planejadas estiverem visíveis, atualizar os marcadores
  if (mostrarRotasPlanejadas) {
    mostrarMarcadoresRotasPlanejadas();
  }
}
