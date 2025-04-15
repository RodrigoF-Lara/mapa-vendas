let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';

const cidadesRC = {
  '1400100': 'NABOR', '1504208': 'FABRÍCIO', '1505502': 'FABRÍCIO',
  '1721000': 'GABRIEL', '2101400': 'CLAUDEMIR', '2800308': 'ESCOURA',
  '2919553': 'PENINHA', '3170206': 'RENAN', '3529005': 'ANDRE',
  '4104808': 'ISRAEL', '4209003': 'WILIAN', '4301602': 'GUSTAVO',
  '4304705': 'LEANDRO TONET', '5003702': 'GRAZIAN', '5102637': 'RODRIGO',
  '5105259': 'JOAO', '5107040': 'GLESON', '5208707': 'RENNAN'
};

const rcIcon = L.divIcon({
  className: 'rc-marker',
  iconSize: [12, 20],
  iconAnchor: [6, 20],
  popupAnchor: [0, -20]
});

function initMap() {
  map = L.map('map').setView([-30.0346, -51.2177], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function carregarDadosAPI() {
  fetch('https://api.sheetbest.com/sheets/8689ec64-90ca-46cb-80bc-7bf17ecb137a')
    .then(response => response.json())
    .then(data => {
      dadosCSV = data;
      popularFiltros();
      carregarGeoJSON();
      mostrarResumoEstado();
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

function carregarGeoJSON() {
  fetch('municipios-RS.geojson')
    .then(response => response.json())
    .then(geojson => {
      L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

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

            let popupContent = `<strong>${feature.properties.NM_MUN}</strong><br>Total QNT: ${totalQnt}`;

            if (rc) {
              popupContent += `<br><strong>RC:</strong> ${rc}`;
              const centroid = turf.centroid(feature).geometry.coordinates;
              L.marker([centroid[1], centroid[0]], {icon: rcIcon})
                .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
                .addTo(map);
            }

            layer.bindPopup(popupContent);
            layer.on('click', () => mostrarTabela(codigoIBGE));
          }
        }
      }).addTo(map);
    })
    .catch(error => console.error('Erro ao carregar GeoJSON:', error));
}

function formatarData(data) {
  if (!data || typeof data !== 'string') return '';
  const partes = data.split('/');
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    return `${dia}/${mes}/${partes[2]}`;
  }
  return '';
}

function mostrarResumoEstado() {
  const dadosEstado = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );
  const totalVendas = dadosEstado.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalClientes = new Set(dadosEstado.map(item => item['TB_CLIENTES.NOME'])).size;

  document.getElementById('dados-cidade').innerHTML = `
    <h3>Resumo do Estado - Ano: ${filtroAnoSelecionado}, Mês: ${filtroMesSelecionado}</h3>
    <p><strong>Total de Vendas:</strong> ${totalVendas.toFixed(0)}</p>
    <p><strong>Total de Clientes:</strong> ${totalClientes}</p>
  `;
}

function popularFiltros() {
  // Verifica se os dados CSV estão carregados corretamente
  if (!dadosCSV || dadosCSV.length === 0) {
    console.error("Dados CSV não carregados corretamente!");
    return;
  }

  const selectAno = document.getElementById('filtro-ano');
  const selectMes = document.getElementById('filtro-mes');

  // Obter anos e meses únicos a partir dos dados CSV
  const anos = [...new Set(dadosCSV.map(item => item.ANO))].sort();
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))].sort((a, b) => a - b);

  // Popular o filtro de ano
  selectAno.innerHTML = anos.map(ano => `<option value="${ano}">${ano}</option>`).join('');
  
  // Popular o filtro de mês, incluindo a opção "Todos"
  selectMes.innerHTML = `<option value="todos">Todos</option>` + 
    meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');

  // Definir valores iniciais dos filtros (se ainda não definidos)
  if (!filtroAnoSelecionado) filtroAnoSelecionado = anos[0]; // Defina o valor inicial para o ano
  if (!filtroMesSelecionado) filtroMesSelecionado = 'todos'; // Defina o valor inicial para o mês

  // Atualizar os filtros com os valores selecionados
  selectAno.value = filtroAnoSelecionado;
  selectMes.value = filtroMesSelecionado;

  // Escutadores de eventos para mudanças nos filtros
  selectAno.addEventListener('change', () => {
    filtroAnoSelecionado = selectAno.value;
    reiniciarMapa();  // Atualizar a visualização do mapa ou tabela
  });

  selectMes.addEventListener('change', () => {
    filtroMesSelecionado = selectMes.value;
    reiniciarMapa();  // Atualizar a visualização do mapa ou tabela
  });
}



function mostrarTabela(codigoIBGE) {
  const vendasCidade = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const tabela = document.createElement('table');
  tabela.innerHTML = `
    <thead>
      <tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Qnt</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${vendasCidade.map(venda => `
        <tr>
          <td>${formatarData(venda.DATA)}</td>
          <td>${venda['TB_PRODUTOS.NOME']}</td>
          <td>${venda['TB_CLIENTES.NOME']}</td>
          <td>${venda.QNT}</td>
          <td>${venda.VALOR_TOTAL}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  document.getElementById('dados-cidade').appendChild(tabela);
}

document.addEventListener('DOMContentLoaded', function () {
  initMap();
  carregarDadosAPI();
});
