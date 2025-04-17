// pdf.js
export function gerarPDF(configuracoesRegioes, dadosCSV) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const regioes = Object.keys(configuracoesRegioes);

  // Função para capturar o mapa de cada região como imagem
  function capturarMapa(regiaoId) {
    return new Promise((resolve, reject) => {
      const mapElement = document.querySelector(`#map-${regiaoId}`);
      html2canvas(mapElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        resolve(imgData);
      }).catch(reject);
    });
  }

  regioes.forEach((regiaoId, index) => {
    const regiao = configuracoesRegioes[regiaoId];
    
    if (index > 0) doc.addPage();
    
    doc.setFontSize(16);
    doc.text(`Dados da Região: ${regiao.nome}`, 20, 20);

    capturarMapa(regiaoId).then(imgData => {
      doc.addImage(imgData, 'PNG', 20, 30, 180, 100);

      let yPosition = 140;
      doc.setFontSize(12);
      doc.text('Cidades com RC:', 20, yPosition);

      Object.entries(regiao.cidadesRC).forEach(([codigoIBGE, rc], i) => {
        yPosition += 10;
        doc.text(`${i + 1}. Código IBGE: ${codigoIBGE} - RC: ${rc}`, 20, yPosition);
      });

      yPosition += 15;
      doc.text('Vendas:', 20, yPosition);
      yPosition += 10;

      const vendasCidade = dadosCSV.filter(item => item['TB_CIDADES.CODIGO_IBGE'] === regiao.cidadesRC[regiaoId]);
      vendasCidade.forEach((venda, i) => {
        yPosition += 10;
        doc.text(`Venda ${i + 1}: ${venda['NOTA']} - Quantidade: ${venda.QNT} - Faturamento: ${venda.FATURAMENTO}`, 20, yPosition);
      });

    }).catch(error => {
      console.error('Erro ao capturar o mapa:', error);
    });
  });

  doc.save('dados_regioes_com_mapas.pdf');
}
