// NOVA FUNÇÃO PARA FILTRAR GRÁFICO
function filtrarGraficoPorCidade(codigoIBGE) {
  const dadosFiltrados = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado
  );

  const meses = Array(12).fill(0);
  dadosFiltrados.forEach(item => {
    const mes = parseInt(item.MÊS) - 1;
    if (mes >= 0 && mes < 12) {
      meses[mes] += parseFloat(item.QNT || 0);
    }
  });

  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
  const cidadeNome = Object.entries(cidadesRC).find(([cod]) => cod === codigoIBGE)?.[1] || 
                    document.querySelector(`[data-codigo="${codigoIBGE}"]`)?.innerText || 
                    'Cidade Selecionada';

  Plotly.newPlot('grafico-mensal', [{
    x: nomesMeses,
    y: meses,
    type: 'bar',
    marker: { color: '#4CAF50' }
  }], {
    title: `Vendas Mensais - ${cidadeNome}`,
    xaxis: { title: 'Mês' },
    yaxis: { title: 'Quantidade' }
  });
}
