let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';
let regiaoAtual = null;

// Inicializa o ícone do marcador
const rcIcon = L.icon({
  iconUrl: 'data/rc/marcador_Jeison.svg',
  iconSize: [35, 51], // Tamanho do ícone (ajuste conforme necessário)
  iconAnchor: [12, 41], // Ponto de ancoragem do ícone (ajuste conforme necessário)
  popupAnchor: [1, -34] // Ponto de ancoragem do popup (ajuste conforme necessário)
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

// Carregar a região
function carregarRegiao(regiaoId) {
  console.log('Carregando região:', regiaoId);
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;
  
  regiaoAtual = configuracoesRegioes[regiaoId];
  
  if (map) {
    map.remove(); // Destruir o mapa existente
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
        console.log('Dados da API:', data.values); // Verifique os dados carregados
        const headers = data.values[0];
        dadosCSV = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
        popularFiltros(); // Chama para popular os filtros de ano e mês
        carregarGeoJSON(); // Agora carrega os marcadores e geojson
        mostrarResumoEstado(); // Exibe o resumo do estado
        gerarGraficoMensal(); // Gera o gráfico mensal
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

          // Aqui vamos garantir que os marcadores sejam exibidos independentemente das vendas
          const popupContent = `
            <strong>${feature.properties.NM_MUN}</strong><br>
            <strong>RC:</strong> ${rc}<br><br>
            <img src="${regiaoAtual.imagem}" alt="Imagem do local de vendas" width="200" />
          `;
          
          L.marker([centroid[1], centroid[0]], { icon: icone })
            .bindPopup(popupContent)
            .addTo(map);
        }
      });

      // Processa os polígonos com estilo dinâmico para as cidades
      L.geoJSON(geojson, {
        style: function(feature) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            return {
              fillColor: totalQnt > 0 ? '#ffeb3b' : '#9e9e9e', // Pintar com cor diferente se houver vendas
              fillOpacity: 0.7,
              weight: 1,
              color: 'black'
            };
          } else {
            return {
              fillColor: '#ffffff', // Sem vendas, sem cor
              fillOpacity: 0.3,
              weight: 1,
              color: 'black'
            };
          }
        },
        onEachFeature: function(feature, layer) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          // Aqui vamos garantir que o popup mostre as informações de vendas ao clicar
          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            const totalFat = vendasCidade.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
            const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            layer.on('click', function() {
              const popupContent = `
                <strong>${feature.properties.NM_MUN}</strong><br>
                <strong>RC:</strong> ${regiaoAtual.cidadesRC[codigoIBGE]}<br><br>
                <strong>📦 Quantidade Vendida:</strong> ${totalQnt}<br>
                <strong>💰 Faturamento:</strong> ${formatadoFAT}<br><br>
                <img src="${regiaoAtual.imagem}" alt="Imagem do local de vendas" width="200" />
              `;
              layer.bindPopup(popupContent).openPopup();
            });
          }
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
    });
}

// Função para mostrar o resumo dos dados do estado
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

  // Obter o nome da região selecionada
  const nomeRegiao = regiaoAtual ? regiaoAtual.nome : 'Estado do RS';

  let html = `
    <p><strong>📍 Total do ${nomeRegiao}</strong></p>
    <p><strong>📦 Quantidade Vendida:</strong> ${totalQNT}</p>
    <p><strong>💰 Faturamento Total:</strong> ${formatadoFAT}</p>
    <p><strong>🌍 Número de Cidades com Vendas:</strong> ${totalCidadesComVendas}</p>
  `;

  container.innerHTML = html;
  gerarGraficoMensal(); 
}

// Função para popular os filtros de ano e mês
function popularFiltros() {
  const selectAno = document.getElementById('filtro-ano');
  const selectMes = document.getElementById('filtro-mes');

  const anos = [...new Set(dadosCSV.map(item => item.ANO))].sort();
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))].sort((a, b) => a - b);

  const anoAtual = new Date().getFullYear().toString();

  selectAno.innerHTML = anos.map(ano => 
    `<option value="${ano}" ${ano === anoAtual ? 'selected' : ''}>${ano}</option>`
  ).join('');
  selectMes.innerHTML = `<option value="todos">Todos</option>` +
    meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');

  filtroAnoSelecionado = selectAno.value;
  filtroMesSelecionado = selectMes.value;

  selectAno.addEventListener('change', () => {
    filtroAnoSelecionado = selectAno.value;
    reiniciarMapa();
    gerarGraficoMensal();
  });

  selectMes.addEventListener('change', () => {
    filtroMesSelecionado = selectMes.value;
    reiniciarMapa();
    gerarGraficoMensal();
  });
}

function reiniciarMapa() {
  map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) return;
    map.removeLayer(layer);
  });

  carregarGeoJSON();
  mostrarResumoEstado();
}

function gerarGraficoMensal() {
  const dadosFiltrados = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const meses = Array(12).fill(0).map((_, i) => i + 1);
  const vendasPorMes = Array(12).fill(0);

  dadosFiltrados.forEach(item => {
    const mes = parseInt(item.MÊS) - 1;
    if (mes >= 0 && mes < 12) {
      vendasPorMes[mes] += parseFloat(item.QNT || 0);
    }
  });

  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];

  const trace = {
    x: nomesMeses,
    y: vendasPorMes,
    type: 'bar',
    marker: { color: '#4CAF50' }
  };

  const layout = {
    title: `Máquinas Vendidas em ${filtroAnoSelecionado}`,
    xaxis: { title: 'Mês' },
    yaxis: { title: 'Quantidade' }
  };

  Plotly.newPlot('grafico-mensal', [trace], layout);
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
