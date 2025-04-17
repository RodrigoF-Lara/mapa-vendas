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
  '4304705': 'LEANDRA',
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
function DadosAPI() {
  const sheetId = '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA';
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
        gerarGraficoMensal(); // Nova linha adicionada
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
      // Primeiro cria todos os marcadores dos RCs
      Object.entries(cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], {icon: rcIcon})
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Depois processa os polígonos normalmente
      L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            layer.setStyle({
              fillColor: totalQnt > 0 ? 'yellow' : 'gray',
              fillOpacity: 0.5,
              weight: 1,
              color: 'black'
            });

            layer.bindPopup(`
              <strong>${feature.properties.NM_MUN}</strong><br>
              Quantidade: ${totalQnt}
              ${cidadesRC[codigoIBGE] ? `<br><strong>RC:</strong> ${cidadesRC[codigoIBGE]}` : ''}
            `);

            layer.on('click', function() {
              mostrarTabela(codigoIBGE);
              filtrarGraficoPorCidade(codigoIBGE);
            });
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

  const rc = cidadesRC[codigoIBGE];
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

  / Preencher as opções de ano e definir o ano atual como selecionado
  selectAno.innerHTML = anos.map(ano => 
    `<option value="${ano}" ${ano === anoAtual ? 'selected' : ''}>${ano}</option>`
  ).join('');

  // Preencher as opções de mês
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

function carregarTurfJS() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@turf/turf@6/turf.min.js';
  script.onload = function() {
    initMap();
    carregarDadosAPI();
  };
  document.head.appendChild(script);
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

document.addEventListener('DOMContentLoaded', function () {
  carregarTurfJS();
});
