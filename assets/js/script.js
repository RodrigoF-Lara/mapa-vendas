let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';
let regiaoAtual = null;

// Inicializa o ícone do marcador
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

// Carregar a região
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
        console.log('Dados da API:', data.values); // Verifique se os dados estão sendo carregados corretamente
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

// Carrega o GeoJSON com os limites dos municípios
function carregarGeoJSON() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);
  
  fetch(caminhoGeoJSON)
    .then(response => response.json())
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Cria marcadores para os RCs específicos da região
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          const icone = L.icon({
            iconUrl: regiaoAtual.marcadorIcone,
            iconSize: [32, 32]
          });

          // Filtra os dados de vendas para colorir a cidade
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          console.log('Vendas da cidade:', vendasCidade); // Verifique os dados filtrados de vendas

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            const popupContent = `
              <strong>${feature.properties.NM_MUN}</strong><br>
              <strong>RC:</strong> ${rc}<br><br>
              <img src="${regiaoAtual.imagem}" alt="Imagem do local de vendas" width="200" />
            `;
            
            L.marker([centroid[1], centroid[0]], { icon: icone })
              .bindPopup(popupContent)
              .addTo(map);

            // Adiciona estilo dinâmico ao polígono da cidade com base nas vendas
            L.geoJSON(geojson, {
              style: function() {
                return {
                  fillColor: '#ffeb3b', // Cor das cidades com vendas
                  fillOpacity: 0.7,
                  weight: 1,
                  color: 'black'
                };
              }
            }).addTo(map);
          }
        }
      });

      // Processa os polígonos com estilo dinâmico para todas as cidades
      L.geoJSON(geojson, {
        style: function() {
          return {
            fillColor: 'gray',
            fillOpacity: 0.3,
            weight: 1,
            color: 'black'
          };
        },
        onEachFeature: function(feature, layer) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          console.log('Vendas cidade para polígonos:', vendasCidade); // Verifique a filtragem

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            
            layer.setStyle({
              fillColor: totalQnt > 0 ? '#ffeb3b' : '#9e9e9e',
              fillOpacity: 0.7
            });
          }
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
    });
}

// Função para filtrar gráfico mensal por cidade
function filtrarGraficoPorCidade(codigoIBGE) {
  const dadosFiltrados = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado
  );

  const meses = Array(12).fill(0);
  dadosFiltrados.forEach(item => {
    const mes = parseInt(item.MÊS) - 1;
    if (mes >= 0 && mes < 12) {
      meses[mes] += parseFloat(item.QNT || 0);
    }
  });

  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
  const cidadeNome = Object.entries(cidadesRC).find(([cod]) => cod === codigoIBGE)?.[1] || 
                    document.querySelector(`[data-codigo="${codigoIBGE}"]`)?.innerText || 
                    'Cidade Selecionada';

  Plotly.newPlot('grafico-mensal', [{
    x: nomesMeses,
    y: meses,
    type: 'bar',
    marker: { color: '#4CAF50' }
  }], {
    title: `Vendas Mensais - ${cidadeNome}`,
    xaxis: { title: 'Mês' },
    yaxis: { title: 'Quantidade' }
  });
}

// Função para formatar datas
function formatarData(data) {
  if (!data || typeof data !== 'string') return '';

  const partes = data.split('/');
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const ano = partes[2];
    return `${dia}/${mes}/${ano}`;
  }

  if (data.includes('-')) {
    const isoPartes = data.split('-');
    if (isoPartes.length === 3) {
      const [ano, mes, dia] = isoPartes;
      return `${dia}/${mes}/${ano}`;
    }
  }

  return data;
}

// Função para mostrar resumo do estado
function mostrarResumoEstado() {
  const container = document.getElementById('dados-cidade');
  const dadosFiltrados = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  if (dadosFiltrados.length === 0) {
    container.innerHTML = '<p>Nenhum dado disponível para o filtro selecionado.</p>';
    return;
  }

  const totalQNT = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFAT = dadosFiltrados.reduce((soma, item) => {
    const valorStr = (item.FATURAMENTO || '0').replace('.', '').replace(',', '.');
    return soma + (isNaN(parseFloat(valorStr)) ? 0 : parseFloat(valorStr));
  }, 0);
  
  const totalCidadesComVendas = [...new Set(dadosFiltrados.map(item => item['TB_CIDADES.CODIGO_IBGE']))].length;

  const formatadoFAT = totalFAT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let html = `
    <p><strong>📍 Total do Estado do RS</strong></p>
    <p><strong>📦 Quantidade Vendida:</strong> ${totalQNT}</p>
    <p><strong>💰 Faturamento Total:</strong> ${formatadoFAT}</p>
    <p><strong>🌍 Número de Cidades com Vendas:</strong> ${totalCidadesComVendas}</p>
  `;

  container.innerHTML = html;
  gerarGraficoMensal(); 
}

function initApp() {
  const turfScript = document.createElement('script');
  turfScript.src = 'https://unpkg.com/@turf/turf@6/turf.min.js';
  turfScript.onload = function() {
    initMap();
    carregarDadosAPI();
  };
  document.head.appendChild(turfScript);
}

initApp();
