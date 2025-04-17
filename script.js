let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';

// Carrega os dados da Google Sheets API
function carregarDadosAPI() {
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
        criarGrafico(); // Chama a função do gráfico
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

// Função para criar o gráfico de vendas por mês
function criarGrafico() {
  const dadosFiltrados = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const vendasPorMes = {};
  dadosFiltrados.forEach(item => {
    const mes = item.MÊS;
    const quantidade = parseFloat(item.QNT || 0);
    if (vendasPorMes[mes]) {
      vendasPorMes[mes] += quantidade;
    } else {
      vendasPorMes[mes] = quantidade;
    }
  });

  const meses = Object.keys(vendasPorMes);
  const quantidades = meses.map(mes => vendasPorMes[mes]);

  const ctx = document.getElementById('grafico-maquinas').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Quantidade de Máquinas Vendidas',
        data: quantidades,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Popular os filtros de ano e mês
function popularFiltros() {
  const selectAno = document.getElementById('filtro-ano');
  const selectMes = document.getElementById('filtro-mes');

  const anos = [...new Set(dadosCSV.map(item => item.ANO))].sort();
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))].sort((a, b) => a - b);

  selectAno.innerHTML = anos.map(ano => `<option value="${ano}">${ano}</option>`).join('');
  selectMes.innerHTML = `<option value="todos">Todos</option>` +
    meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');

  filtroAnoSelecionado = selectAno.value;
  filtroMesSelecionado = selectMes.value;

  selectAno.addEventListener('change', () => {
    filtroAnoSelecionado = selectAno.value;
    reiniciarMapa();
    criarGrafico(); // Atualiza o gráfico
  });

  selectMes.addEventListener('change', () => {
    filtroMesSelecionado = selectMes.value;
    reiniciarMapa();
    criarGrafico(); // Atualiza o gráfico
  });
}

// Reinicia o mapa
function reiniciarMapa() {
  map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) return;
    map.removeLayer(layer);
  });

  carregarGeoJSON();
  mostrarResumoEstado();
}

document.addEventListener('DOMContentLoaded', function () {
  initMap();
  carregarDadosAPI(); // Carrega os dados ao iniciar
});
