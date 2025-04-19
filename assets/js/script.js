let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';
let regiaoAtual = null;

// Inicializa o ícone do marcador
const rcIcon = L.icon({
  iconUrl: 'data/rc/marcador_Jeison.svg', // Ícone do RC
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
            iconSize: [32, 32] // Tamanho do ícone do RC
          });

          // Exibe o marcador com a imagem do RC
          const popupContent = ` 
            <strong>${feature.properties.NM_MUN}</strong><br>
            <strong>📦 Quantidade Vendida:</strong> ${0}<br>
            <strong>💰 Faturamento:</strong> ${0}<br><br>
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

          // Exibe o popup de vendas ao clicar nas cidades
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
              mostrarTabela(codigoIBGE); // Chama a função para mostrar a tabela de vendas da cidade
            });
          }
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
    });
}

// Função para mostrar a tabela de vendas por cidade
function mostrarTabela(codigoIBGE) {
  const vendas = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const container = document.getElementById('dados-cidade');

  if (vendas.length === 0) {
    container.innerHTML = '<p>Nenhuma venda para a cidade nesse filtro.</p>';
    return;
  }

  const totalQNT = vendas.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFAT = vendas.reduce((soma, item) => {
    const valorStr = (item.FATURAMENTO || '0').replace('.', '').replace(',', '.');
    return soma + (isNaN(parseFloat(valorStr)) ? 0 : parseFloat(valorStr));
  }, 0);
  
  const formatadoFAT = totalFAT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Obter o nome da cidade
  const cidadeNome = vendas[0].CIDADE;

  let html = `
    <p><strong>${cidadeNome} - Vendas</strong></p>
    <p><strong>📦 Total de Quantidade Vendida:</strong> ${totalQNT}</p>
    <p><strong>💰 Total de Faturamento:</strong> ${formatadoFAT}</p>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>NOTA</th>
            <th>PEDIDO</th>
            <th>CLIENTE</th>
            <th>CIDADE</th>
            <th>DESCRIÇÃO</th>
            <th>QNT</th>
            <th>FATURAMENTO</th>
            <th>DATA</th>
          </tr>
        </thead>
        <tbody>`;

  vendas.forEach(item => {
    html += `
          <tr>
            <td>${item.NOTA}</td>
            <td>${item.PEDIDO}</td>
            <td>${item.CLIENTE}</td>
            <td>${item.CIDADE}</td>
            <td>${item['DESCRIÇÃO']}</td>
            <td>${item.QNT}</td>
            <td>${parseFloat((item.FATURAMENTO || '0').replace('.', '').replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${formatarData(item.DATA)}</td>
          </tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

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
