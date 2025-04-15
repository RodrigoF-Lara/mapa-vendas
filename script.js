// script.js
document.addEventListener('DOMContentLoaded', function() {
  // Carregar o arquivo CSV
  fetch('vendas.csv')
    .then(response => response.text())
    .then(data => processCSV(data))
    .catch(error => console.error('Erro ao carregar o CSV:', error));
  
  function processCSV(csvData) {
    const rows = csvData.split('\n');
    const header = rows[0].split(',');
    const vendas = [];

    // Processar as linhas de vendas
    rows.slice(1).forEach(row => {
      const cols = row.split(',');
      if (cols.length === header.length) {
        vendas.push({
          municipio: cols[0],
          valor_venda: parseFloat(cols[1]),
          quantidade_vendida: parseInt(cols[2]),
        });
      }
    });

    // Agrupar os dados por município
    const vendasPorMunicipio = {};
    vendas.forEach(venda => {
      if (!vendasPorMunicipio[venda.municipio]) {
        vendasPorMunicipio[venda.municipio] = { valor_venda: 0, quantidade_vendida: 0 };
      }
      vendasPorMunicipio[venda.municipio].valor_venda += venda.valor_venda;
      vendasPorMunicipio[venda.municipio].quantidade_vendida += venda.quantidade_vendida;
    });

    // Preparar os dados para o gráfico
    const municipios = Object.keys(vendasPorMunicipio);
    const valores = municipios.map(municipio => vendasPorMunicipio[municipio].valor_venda);
    const quantidades = municipios.map(municipio => vendasPorMunicipio[municipio].quantidade_vendida);

    // Gerar o gráfico com Plotly
    const trace1 = {
      x: municipios,
      y: valores,
      type: 'bar',
      name: 'Valor de Vendas',
      marker: { color: 'blue' }
    };

    const trace2 = {
      x: municipios,
      y: quantidades,
      type: 'bar',
      name: 'Quantidade Vendida',
      marker: { color: 'green' }
    };

    const data = [trace1, trace2];
    const layout = {
      barmode: 'group',
      title: 'Vendas por Município',
      xaxis: { title: 'Município' },
      yaxis: { title: 'Valor (R$) / Quantidade' },
    };

    Plotly.newPlot('grafico', data, layout);
  }
});
