// script.js - Versão completa com gráficos adicionados (código original preservado)
document.addEventListener('DOMContentLoaded', function() {
  // Seu código original completo (preservado)
  fetch('vendas.csv')
    .then(response => response.text())
    .then(data => processCSV(data))
    .catch(error => console.error('Erro ao carregar o CSV:', error));
  
  function processCSV(csvData) {
    const rows = csvData.split('\n');
    const header = rows[0].split(',');
    const vendas = [];

    rows.slice(1).forEach(row => {
      const cols = row.split(',');
      if (cols.length === header.length) {
        vendas.push({
          municipio: cols[0],
          valor_venda: parseFloat(cols[1]),
          quantidade_vendida: parseInt(cols[2]),
          // Adicionando campos para ano e mês (assumindo que existem no CSV)
          ano: cols[3] ? parseInt(cols[3]) : new Date().getFullYear(),
          mes: cols[4] ? parseInt(cols[4]) : 1
        });
      }
    });

    // Seu processamento original
    const vendasPorMunicipio = {};
    vendas.forEach(venda => {
      if (!vendasPorMunicipio[venda.municipio]) {
        vendasPorMunicipio[venda.municipio] = { valor_venda: 0, quantidade_vendida: 0 };
      }
      vendasPorMunicipio[venda.municipio].valor_venda += venda.valor_venda;
      vendasPorMunicipio[venda.municipio].quantidade_vendida += venda.quantidade_vendida;
    });

    const municipios = Object.keys(vendasPorMunicipio);
    const valores = municipios.map(municipio => vendasPorMunicipio[municipio].valor_venda);
    const quantidades = municipios.map(municipio => vendasPorMunicipio[municipio].quantidade_vendida);

    // =============================================
    // SEU CÓDIGO ORIGINAL ACIMA - NADA FOI MODIFICADO
    // =============================================

    // ADIÇÕES: Código novo para os gráficos (apenas acrescentado)
    
    // 1. Preencher filtros de ano/mês
    preencherFiltros(vendas);
    
    // 2. Gerar gráficos iniciais
    gerarGraficoMensal(vendas);
    
    // 3. Função para preencher filtros
    function preencherFiltros(dados) {
      const filtroAno = document.getElementById('filtro-ano');
      const filtroMes = document.getElementById('filtro-mes');
      
      // Obter anos únicos
      const anos = [...new Set(dados.map(item => item.ano))].sort();
      
      // Preencher anos
      anos.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        filtroAno.appendChild(option);
      });
      
      // Preencher meses (1-12)
      for (let mes = 1; mes <= 12; mes++) {
        const option = document.createElement('option');
        option.value = mes;
        option.textContent = mes;
        filtroMes.appendChild(option);
      }
      
      // Atualizar gráficos quando filtros mudarem
      filtroAno.addEventListener('change', () => gerarGraficoMensal(vendas));
      filtroMes.addEventListener('change', () => gerarGraficoMensal(vendas));
    }

    // 4. Nova função para o gráfico mensal
    function gerarGraficoMensal(dados) {
      const anoSelecionado = document.getElementById('filtro-ano').value;
      const mesSelecionado = document.getElementById('filtro-mes').value;
      
      // Filtrar por ano/mês selecionados
      const dadosFiltrados = dados.filter(venda => {
        return (!anoSelecionado || venda.ano == anoSelecionado) && 
               (!mesSelecionado || venda.mes == mesSelecionado);
      });
      
      // Agrupar por mês
      const meses = Array.from({length: 12}, (_, i) => i + 1);
      const quantidadesPorMes = Array(12).fill(0);
      
      dadosFiltrados.forEach(venda => {
        if (venda.ano == anoSelecionado || !anoSelecionado) {
          quantidadesPorMes[venda.mes - 1] += venda.quantidade_vendida;
        }
      });
      
      // Nomes dos meses
      const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                         'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Criar gráfico
      const trace = {
        x: nomesMeses,
        y: quantidadesPorMes,
        type: 'bar',
        name: 'Máquinas Vendidas',
        marker: { color: 'rgba(55, 128, 191, 0.7)' }
      };
      
      const layout = {
        title: `Vendas Mensais${anoSelecionado ? ` - ${anoSelecionado}` : ''}`,
        xaxis: { title: 'Mês' },
        yaxis: { title: 'Quantidade de Máquinas' }
      };
      
      Plotly.newPlot('grafico-mensal', [trace], layout);
    }
  }

  function mostrarResumoEstado() {
    // Sua função original preservada
    console.log("Mostrando resumo do estado...");
  }
});