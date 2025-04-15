let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';

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
      reiniciarMapa();
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

function carregarGeoJSON() {
  fetch('municipios-RS.geojson')
    .then(response => response.json())
    .then(geojson => {
      L.geoJSON(geojson, {
        onEachFeature: processarMunicipio
      }).addTo(map);

      mostrarResumoEstado();
    })
    .catch(error => console.error('Erro ao carregar GeoJSON:', error));
}

function processarMunicipio(feature, layer) {
  const codigoIBGE = feature.properties.CD_MUN;
  const vendasCidade = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const rc = cidadesRC[codigoIBGE];
  const nomeCidade = feature.properties.NM_MUN || 'Cidade desconhecida';

  if (vendasCidade.length > 0) {
    const totalQNT = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
    const cor = totalQNT > 0 ? 'yellow' : 'gray';

    layer.setStyle({
      fillColor: cor,
      fillOpacity: 0.5,
      weight: 1,
      color: 'black'
    });

    let popupContent = `<strong>${nomeCidade}</strong><br>Total QNT: ${totalQNT}`;
    if (rc) {
      popupContent += `<br><strong>RC:</strong> ${rc}`;
      const [lng, lat] = turf.centroid(feature).geometry.coordinates;
      L.marker([lat, lng], { icon: rcIcon })
        .bindPopup(popupContent)
        .addTo(map);
    }

    layer.bindPopup(popupContent);
    layer.on('click', () => mostrarTabela(codigoIBGE));
  } else {
    layer.setStyle({
      fillColor: 'gray',
      fillOpacity: 0.3,
      weight: 1,
      color: 'black'
    });

    if (rc) {
      const [lng, lat] = turf.centroid(feature).geometry.coordinates;
      L.marker([lat, lng], { icon: rcIcon })
        .bindPopup(`<strong>${nomeCidade}</strong><br><strong>RC:</strong> ${rc}`)
        .addTo(map);
    }
  }
}

function formatarData(data) {
  if (!data || typeof data !== 'string') return '';
  const partes = data.split('/');
  if (partes.length === 3) return `${partes[0].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[2]}`;
  const iso = data.split('-');
  if (iso.length === 3) return `${iso[2]}/${iso[1]}/${iso[0]}`;
  return data;
}

function mostrarResumoEstado() {
  const container = document.getElementById('dados-cidade');
  const dadosFiltrados = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  if (!dadosFiltrados.length) {
    container.innerHTML = '<p>Nenhum dado disponível para o filtro selecionado.</p>';
    return;
  }

  const totalQNT = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFAT = dadosFiltrados.reduce((soma, item) => {
    const valor = (item.FATURAMENTO || '0').replace('.', '').replace(',', '.');
    return soma + (isNaN(parseFloat(valor)) ? 0 : parseFloat(valor));
  }, 0);

  container.innerHTML = `
    <p><strong>📍 Total do Estado do RS</strong></p>
    <p><strong>📦 Quantidade Vendida:</strong> ${totalQNT}</p>
    <p><strong>💰 Faturamento Total:</strong> ${totalFAT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
  `;
}

function mostrarTabela(codigoIBGE) {
  const vendas = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const container = document.getElementById('dados-cidade');

  if (!vendas.length) {
    container.innerHTML = '<p>Nenhuma venda para a cidade nesse filtro.</p>';
    return;
  }

  const totalQNT = vendas.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFAT = vendas.reduce((soma, item) => {
    const valor = (item.FATURAMENTO || '0').replace('.', '').replace(',', '.');
    return soma + (isNaN(parseFloat(valor)) ? 0 : parseFloat(valor));
  }, 0);

  const rc = cidadesRC[codigoIBGE];
  const rcInfo = rc ? `<p><strong>🏠 RC:</strong> ${rc}</p>` : '';

  let html = `
    ${rcInfo}
    <p><strong>📦 Total de Quantidade Vendida:</strong> ${totalQNT}</p>
    <p><strong>💰 Total de Faturamento:</strong> ${totalFAT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>NOTA</th><th>PEDIDO</th><th>CLIENTE</th><th>CIDADE</th>
            <th>DESCRIÇÃO</th><th>QNT</th><th>FATURAMENTO</th><th>DATA</th>
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
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))].sort((a, b) => parseInt(a) - parseInt(b));

  selectAno.innerHTML = anos.map(ano => `<option value="${ano}">${ano}</option>`).join('');
  selectMes.innerHTML = `<option value="todos">Todos</option>` + meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');

  filtroAnoSelecionado = selectAno.options[0].value;
  filtroMesSelecionado = 'todos';

  selectAno.value = filtroAnoSelecionado;
  selectMes.value = filtroMesSelecionado;

  selectAno.addEventListener('change', () => {
    filtroAnoSelecionado = selectAno.value;
    reiniciarMapa();
  });

  selectMes.addEventListener('change', () => {
    filtroMesSelecionado = selectMes.value;
    reiniciarMapa();
  });
}

function reiniciarMapa() {
  map.eachLayer(layer => {
    if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
  });

  carregarGeoJSON();
}
