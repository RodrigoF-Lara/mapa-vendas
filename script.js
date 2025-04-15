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

            const nomeCidade = feature.properties.NM_MUN || 'Cidade desconhecida';
            let popupContent = `<strong>${nomeCidade}</strong><br>Total QNT: ${totalQnt}`;
            
            if (rc) {
              popupContent += `<br><strong>RC:</strong> ${rc}`;
              
              const centroid = turf.centroid(feature).geometry.coordinates;
              L.marker([centroid[1], centroid[0]], {icon: rcIcon})
                .bindPopup(`<strong>${nomeCidade}</strong><br><strong>RC:</strong> ${rc}`)
                .addTo(map);
            }

            layer.bindPopup(popupContent);

            layer.on('click', () => {
              mostrarTabela(codigoIBGE);
            });
          } else if (rc) {
            const nomeCidade = feature.properties.NM_MUN || 'Cidade desconhecida';
            const centroid = turf.centroid(feature).geometry.coordinates;
            L.marker([centroid[1], centroid[0]], {icon: rcIcon})
              .bindPopup(`<strong>${nomeCidade}</strong><br><strong>RC:</strong> ${rc}`)
              .addTo(map);
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
    .catch(error => console.error('Erro ao carregar o GeoJSON:', error));
}

function mostrarResumoEstado() {
  let resumoHTML = '';

  if (!filtroAnoSelecionado || !filtroMesSelecionado) {
    resumoHTML += 'Por favor, selecione um ano e mês válidos para exibir um resumo.';
  } else {
    const resumo = dadosCSV.filter(item => item.ANO === filtroAnoSelecionado && 
                                            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado));

    if (resumo.length > 0) {
      resumoHTML += `<h3>Resumo de Vendas</h3>`;
      resumo.forEach(item => {
        resumoHTML += `
          <p><strong>RC:</strong> ${item['TB_CIDADES.CODIGO_IBGE']}</p>
          <p><strong>Quantidade:</strong> ${item.QNT}</p>
          <p><strong>Mês:</strong> ${item.MÊS}</p>
        `;
      });
    } else {
      resumoHTML += 'Nenhum dado encontrado para esse filtro.';
    }
  }
  document.getElementById('dados-cidade').innerHTML = resumoHTML;
}

function popularFiltros() {
  const anos = [...new Set(dadosCSV.map(item => item.ANO))];
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))];

  const filtroAno = document.getElementById('filtro-ano');
  const filtroMes = document.getElementById('filtro-mes');

  anos.forEach(ano => {
    filtroAno.innerHTML += `<option value="${ano}">${ano}</option>`;
  });

  meses.forEach(mes => {
    filtroMes.innerHTML += `<option value="${mes}">${mes}</option>`;
  });

  filtroAno.addEventListener('change', function() {
    filtroAnoSelecionado = this.value;
    mostrarResumoEstado();
  });

  filtroMes.addEventListener('change', function() {
    filtroMesSelecionado = this.value;
    mostrarResumoEstado();
  });

  filtroAnoSelecionado = anos[0];
  filtroMesSelecionado = 'todos';
  filtroAno.value = filtroAnoSelecionado;
  filtroMes.value = filtroMesSelecionado;
}

window.onload = function() {
  initMap();
  carregarDadosAPI();
};
