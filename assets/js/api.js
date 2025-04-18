// Função para carregar os dados da API do Google Sheets
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
        popularFiltros();      // Função para popular os filtros com dados
        carregarGeoJSON();     // Função para carregar os limites dos municípios no mapa
        mostrarResumoEstado(); // Função para mostrar um resumo dos dados
        gerarGraficoMensal();  // Função para gerar gráfico mensal de vendas
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}
