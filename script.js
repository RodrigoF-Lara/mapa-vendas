// script.js
document.addEventListener('DOMContentLoaded', function() {
  let dadosCompletos = []; // Armazenar todos os dados para filtragem

  // Carregar o arquivo CSV
  fetch('vendas.csv')
    .then(response => response.text())
    .then(data => processCSV(data))
    .catch(error => console.error('Erro ao carregar o CSV:', error));
  
  function processCSV(csvData) {
    const rows = csvData.split('\n');
    const header = rows[0].split(',');
    dadosCompletos = [];

    // Processar as linhas de vendas - assumindo que agora temos colunas para ano e mês
    rows.slice(1).forEach(row => {
      const cols = row.split(',');
      if (cols.length === header.length) {
        const venda = {
          municipio: cols[0],
          valor_venda: parseFloat(cols[1]),
          quantidade_vendida: parseInt(cols[2]),
          ano: cols[3] ? parseInt(cols[3]) : new Date().getFullYear(), // assumindo que a coluna 3 é o ano
          mes: cols[4] ? parseInt(cols[4]) : 1 // assumindo que a coluna 4 é o mês
        };
        dadosCompletos.push(venda);
      }
    });

    // Preencher filtros de ano e mês
    preencherFiltros();
    
    // Gerar gráficos iniciais
    atualizarGraficos();
  }

  function preencherFiltros() {
    const filtroAno = document.getElementById('filtro-ano');
    const filtroMes = document.getElementById('filtro-mes');
    
    // Obter anos únicos
    const anos = [...new Set(dadosCompletos.map(item => item.ano))].sort();
    
    // Limpar e preencher anos
    filtroAno.innerHTML = '';
    anos.forEach(ano => {
      const option = document.createElement('option');
      option.value = ano;
      option.textContent = ano;
      filtroAno.appendChild(option);
    });
    
    // Preencher meses (fixos de 1 a 12)
    filtroMes.innerHTML = '';
    for (let mes = 1; mes <= 12; mes++) {
      const option = document.createElement('option');
      option.value = mes;
      option.textContent = mes;
      filtroMes.appendChild(option);
    }
    
    // Adicionar event listeners para atualizar gráficos quando filtros mudarem
    filtroAno.addEventListener('change', atualizarGraficos);
    filtroMes.addEventListener('change', atualizarGraficos);
  }

  function atualizarGraficos() {
    const anoSelecionado = document.getElementById('filtro-ano').value;
    const mesSelecionado = document.getElementById('filtro-mes').value;
    
    // Filtrar dados conforme seleção
    const dadosFiltrados = dadosCompletos.filter(item => {
      return (!anoSelecionado || item.ano == anoSelecionado) && 
             (!mesSelecionado || item.mes == mesSelecionado);
    });
    
    // Gerar gráfico de vendas por município
    gerarGraficoVendasMunicipio(dadosFiltrados);
    
    // Gerar gráfico mensal (agrupado por mês)
    gerarGraficoMensal(dadosFiltrados, anoSelecionado);
  }

  function gerarGraficoVendasMunicipio(dados) {
    // Agrupar os dados por município
    const vendasPorMunicipio = {};
    dados.forEach(venda => {
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

    Plotly.newPlot('grafico-vendas-municipio', data, layout);
  }

  function gerarGraficoMensal(dados, anoSelecionado) {
    // Agrupar dados por mês para o ano selecionado
    const meses = Array.from({length: 12}, (_, i) => i + 1); // [1, 2, ..., 12]
    const quantidadesPorMes = Array(12).fill(0);
    
    dados.forEach(venda => {
      if (venda.ano == anoSelecionado) {
        quantidadesPorMes[venda.mes - 1] += venda.quantidade_vendida;
      }
    });
    
    // Nomes dos meses para exibição
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Criar gráfico de linha para vendas mensais
    const trace = {
      x: nomesMeses,
      y: quantidadesPorMes,
      type: 'line+bar',
      name: 'Máquinas Vendidas',
      marker: { color: 'orange' },
      line: { color: 'red', width: 2 }
    };
    
    const layout = {
      title: `Vendas Mensais - ${anoSelecionado}`,
      xaxis: { title: 'Mês' },
      yaxis: { title: 'Quantidade de Máquinas Vendidas' }
    };
    
    Plotly.newPlot('grafico-mensal', [trace], layout);
  }

  function mostrarResumoEstado() {
    // Implementação existente ou nova conforme necessário
    console.log("Mostrando resumo do estado...");
  }
});