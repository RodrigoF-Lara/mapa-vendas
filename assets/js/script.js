// Verificação de variáveis já declaradas
if (typeof dadosCSV === 'undefined') {
  var dadosCSV = [];
}
if (typeof map === 'undefined') {
  var map;
}
if (typeof filtroAnoSelecionado === 'undefined') {
  var filtroAnoSelecionado = '';
}
if (typeof filtroMesSelecionado === 'undefined') {
  var filtroMesSelecionado = 'todos';
}
if (typeof regiaoAtual === 'undefined') {
  var regiaoAtual = null;
}

// Inicializa o ícone do marcador
const rcIcon = L.icon({
  iconUrl: 'data/rc/marcador_Jeison.svg',
  iconSize: [35, 51],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
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
    map.remove();
  }
  
  dadosCSV = [];
  filtroAnoSelecionado = '';
  filtroMesSelecionado = 'todos';
  
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
        console.log('Dados da API:', data.values);
        const headers = data.values[0];
        dadosCSV = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
        popularFiltros();
        carregarGeoJSON();
        gerarGraficoMensal();
        mostrarResumoEstado();
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

          // Popup com verificação segura da imagem
          const popupContent = ` 
            <strong>${feature.properties.NM_MUN}</strong><br>
            <strong>📦 Quantidade Vendida:</strong> ${0}<br>
            <strong>💰 Faturamento:</strong> ${0}<br><br>
            ${regiaoAtual && regiaoAtual.imagem ? 
              `<img src="${regiaoAtual.imagem}" alt="Imagem do local de vendas" width="200" />` : 
              ''}
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
              fillColor: totalQnt > 0 ? '#ffeb3b' : '#9e9e9e',
              fillOpacity: 0.7,
              weight: 1,
              color: 'black'
            };
          } else {
            return {
              fillColor: '#ffffff',
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

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            const totalFat = vendasCidade.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
            const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            layer.on('click', function() {
              const popupContent = `
                <strong>${feature.properties.NM_MUN}</strong><br>
                <strong>📦 Quantidade Vendida:</strong> ${totalQnt}<br>
                <strong>💰 Faturamento:</strong> ${formatadoFAT}<br><br>
              `;
              layer.bindPopup(popupContent).openPopup();
              mostrarTabela(codigoIBGE);
            });
          }
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
    });
}

// Função para mostrar a tabela de vendas da cidade selecionada
function mostrarTabela(codigoIBGE) {
  if (!codigoIBGE || !dadosCSV.length) return;

  const vendasCidade = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  vendasCidade.sort((a, b) => {
    const mesA = parseInt(a.MÊS);
    const mesB = parseInt(b.MÊS);
    if (mesA !== mesB) return mesA - mesB;
    return parseInt(a.DIA) - parseInt(b.DIA);
  });

  let tabelaHTML = `
    <h3>Detalhes de Vendas</h3>
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Produto</th>
          <th>Quantidade</th>
          <th>Faturamento</th>
        </tr>
      </thead>
      <tbody>
  `;

  vendasCidade.forEach(venda => {
    const dataFormatada = `${venda.DIA}/${venda.MÊS}/${venda.ANO}`;
    const faturamentoFormatado = parseFloat(venda.FATURAMENTO || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    tabelaHTML += `
      <tr>
        <td>${dataFormatada}</td>
        <td>${venda['TB_PRODUTOS.NOME'] || 'N/A'}</td>
        <td>${venda.QNT || 0}</td>
        <td>${faturamentoFormatado}</td>
      </tr>
    `;
  });

  tabelaHTML += `
      </tbody>
    </table>
  `;

  document.getElementById('dados-cidade').innerHTML = tabelaHTML;
}

// Função para mostrar o resumo geral do estado
function mostrarResumoEstado() {
  if (!dadosCSV.length) return;

  const vendasFiltradas = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const totalQnt = vendasFiltradas.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFat = vendasFiltradas.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
  const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const resumoHTML = `
    <h3>Resumo do Estado</h3>
    <p><strong>Total de Máquinas Vendidas:</strong> ${totalQnt}</p>
    <p><strong>Faturamento Total:</strong> ${formatadoFAT}</p>
  `;

  document.getElementById('dados-cidade').innerHTML = resumoHTML;
}

// Função para gerar o gráfico mensal
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
    mostrarResumoEstado();
  });

  selectMes.addEventListener('change', () => {
    filtroMesSelecionado = selectMes.value;
    reiniciarMapa();
    gerarGraficoMensal();
    mostrarResumoEstado();
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
