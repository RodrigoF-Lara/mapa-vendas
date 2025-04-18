// PDF-related functions (for generating reports)
function gerarRelatorioPDF() {
  const doc = new jsPDF();
  doc.text("Relatório de Vendas", 10, 10);
  doc.text(`Ano: ${filtroAnoSelecionado}`, 10, 20);
  doc.text(`Mês: ${filtroMesSelecionado}`, 10, 30);
  doc.autoTable({ html: '#tabela-relatorio' });
  doc.save('relatorio-vendas.pdf');
}
