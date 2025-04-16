// Variáveis globais
let graficoVendas;
let mapa;

// Função para carregar os dados da API e gerar gráficos
function carregarDadosAPI() {
  const anoSelecionado = document.getElementById('ano').value;
  const mesSelecionado = document.getElementById('mes').value;

  // Dados simulados para teste
  const dadosVendas = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [{
      label: 'Quantidade de Vendas por Mês',
      data: [15, 30, 45, 60, 20, 50],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true
    }]
  };

  // Gerar gráfico de vendas
  if (graficoVendas) {
    graficoVendas.destroy();
  }
  const ctx = document.getElementById('grafico-vendas').getContext('2d');
  graficoVendas = new Chart(ctx, {
    type: 'line',
    data: dadosVendas,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Carregar o mapa
  carregarMapa();
}

// Função para carregar o mapa
function carregarMapa() {
  if (mapa) {
    mapa.remove();  // Limpa o mapa anterior
  }

  mapa = L.map('mapa').setView([-30.0, -51.0], 6);  // Defina a latitude e longitude para o centro do Brasil

  // Adicionando o mapa de fundo
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa);

  // Carregar GeoJSON para o mapa
  fetch('municipios-RS.geojson')  // Substitua pelo arquivo correto
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data).addTo(mapa);
    });
}

// Chamando a função ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
  carregarDadosAPI();
});
