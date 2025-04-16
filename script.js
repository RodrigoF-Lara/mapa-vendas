// ID da planilha com os dados
const spreadsheetId = '1YnrX7_3VMxqgejAXp_-tbuI_fLbyQO5S';

// Variáveis globais
let graficoVendas;
let mapa;

// Função para carregar os dados da API e gerar gráficos
async function carregarDadosAPI() {
  const anoSelecionado = document.getElementById('ano').value;
  const mesSelecionado = document.getElementById('mes').value;

  // Carregar dados da planilha do Google Sheets
  const dadosVendas = await obterDadosVendas(anoSelecionado, mesSelecionado);

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

// Função para obter dados da planilha Google Sheets
async function obterDadosVendas(ano, mes) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Página1?majorDimension=ROWS&key=YOUR_GOOGLE_SHEETS_API_KEY`;
  
  const response = await fetch(url);
  const data = await response.json();

  // Filtrando os dados por ano e mês
  const vendasPorMes = {
    labels: [],
    datasets: [{
      label: 'Quantidade de Vendas por Mês',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true
    }]
  };

  const vendas = data.values.slice(1);  // Ignora o cabeçalho

  vendas.forEach((venda) => {
    const [nota, nfOrigem, pedido, cliente, ibge, uf, cidade, produto, descricao, qnt, faturamento, dataVenda, mesVenda, anoVenda, regiao, rc, coordenador, mqnTransAcessPecas, tpCultura, coordenacao, clienteMun, codigoIbge, xLon, yLat] = venda;

    if (anoVenda === ano && mesVenda === mes) {
      vendasPorMes.labels.push(dataVenda);
      vendasPorMes.datasets[0].data.push(qnt);
    }
  });

  return vendasPorMes;
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
