// Chart-related functions
function gerarGraficoMensal() {
  const dadosFiltrados = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const meses = Array(12).fill(0).map((_, i) => i + 1);
  const vendasPorMes = Array(12).fill(0);

  dadosFiltrados.forEach(item => {
    const mes = parseInt(item.MÊS) - 1;
    if (mes >= 0 && mes < 12) {
      vendasPorMes[mes] += parseFloat(item.QNT || 0);
    }
  });

  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];

  const trace = {
    x: nomesMeses,
    y: vendasPorMes,
    type: 'bar',
    marker: { color: '#4CAF50' }
  };

  const layout = {
    title: `Máquinas Vendidas em ${filtroAnoSelecionado}`,
    xaxis: { title: 'Mês' },
    yaxis: { title: 'Quantidade' }
  };

  Plotly.newPlot('grafico-mensal', [trace], layout);
}
