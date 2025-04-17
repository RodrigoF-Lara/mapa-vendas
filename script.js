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

// Restante do script.js mantido igual...
// [Cole aqui todo o restante do seu script.js original]
// Carrega o GeoJSON com os limites dos municípios
function carregarGeoJSON() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  // Codifica o caminho para lidar com espaços e caracteres especiais
  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);
  
  fetch(caminhoGeoJSON)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Criação dos marcadores dos RCs ESPECÍFICOS DA REGIÃO
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          // Verifica se o Turf.js está carregado
          if (!turf) {
            console.error('Turf.js não está carregado');
            return;
          }
          
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], { icon: rcIcon })
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Pintar as cidades onde os RCs moram (opção 1)
      L.geoJSON(geojson, {
        style: function(feature) {
          const codigoIBGE = feature.properties.CD_MUN;
          const destaqueRC = regiaoAtual.cidadesRC[codigoIBGE];

          return {
            fillColor: (destaqueRC ? '#ffeb3b' : '#9e9e9e'), // Cor amarela para cidade com vendas, cinza caso contrário
            fillOpacity: 0.7,
            weight: destaqueRC ? 9 : 1,  // Linha grossa (5px) nas cidades com RC, e mais fina (1px) para outras cidades
            color: destaqueRC ? '#FF6347' : 'black',  // Linha vermelha (para as cidades com RC), preta para outras
          };
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
            
            // A cidade com RC ainda terá borda vermelha grossa, mas a cor de preenchimento permanece amarela para vendas
            layer.setStyle({
              fillColor: totalQnt > 0 ? '#ffeb3b' : '#9e9e9e', // Amarelo para cidades com vendas, cinza caso contrário
              fillOpacity: 0.7,
              weight: regiaoAtual.cidadesRC[codigoIBGE] ? 5 : 1,  // Borda grossa se tiver RC
              color: regiaoAtual.cidadesRC[codigoIBGE] ? '#FF6347' : 'black',  // Borda vermelha para cidades com RC
            });

            const popupContent = `
              <div class="map-popup">
                <h4>${feature.properties.NM_MUN}</h4>
                <p>Quantidade: ${totalQnt}</p>
                ${regiaoAtual.cidadesRC[codigoIBGE] ? `<p>RC: ${regiaoAtual.cidadesRC[codigoIBGE]}</p>` : ''}
              </div>`;
            
            layer.bindPopup(popupContent);

            layer.on('click', function() {
              mostrarTabela(codigoIBGE);
              filtrarGraficoPorCidade(codigoIBGE);
            });
          }

          // Hover effects
          layer.on('mouseover', function() {
            this.setStyle({
              weight: 6,  // Aumenta a borda ao passar o mouse
              color: '#666'
            });
          });
          
          layer.on('mouseout', function() {
            this.setStyle({
              weight: regiaoAtual.cidadesRC[codigoIBGE] ? 5 : 1,  // Restaura a borda original
              color: regiaoAtual.cidadesRC[codigoIBGE] ? '#FF6347' : 'black',
            });
          });
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
      console.error('Caminho tentado:', regiaoAtual.geojsonPath);
    });
}

// NOVA FUNÇÃO PARA FILTRAR GRÁFICO
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
  // Resetar gráfico para mostrar todos os dados
  gerarGraficoMensal(); 
}

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
    return soma + parseFloat(valorStr);
  }, 0);
  const formatadoFAT = totalFAT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const rc = regiaoAtual.cidadesRC[codigoIBGE];
  let rcInfo = '';
  if (rc) {
    rcInfo = `<p><strong>🏠 RC:</strong> ${rc}</p>`;
  }

  let html = `
    ${rcInfo}
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

function popularFiltros() {
  const selectAno = document.getElementById('filtro-ano');
  const selectMes = document.getElementById('filtro-mes');

  const anos = [...new Set(dadosCSV.map(item => item.ANO))].sort();
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))].sort((a, b) => a - b);

  // Obter ano atual
  const anoAtual = new Date().getFullYear().toString();

  selectAno.innerHTML = anos.map(ano => 
    `<option value="${ano}" ${ano === anoAtual ? 'selected' : ''}>${ano}</option>`
  ).join('');
  selectMes.innerHTML = `<option value="todos">Todos</option>` +
    meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');

  // Atualizar variáveis globais com os valores selecionados
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

// ============= NOVAS FUNÇÕES PARA O GRÁFICO =============
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

initApp();
