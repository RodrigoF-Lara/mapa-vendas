// Configurações das regiões
const configuracoesRegioes = {
  rs_sul: {
    view: [-30.0346, -51.2177],
    zoom: 6,
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA', // Substitua pelo ID real da planilha
    geojsonPath: 'data/geojson/municipios-RS_SUL.geojson',
    marcadorIcone: 'data/rc/marcador_Gustavo.svg',
    imagem: 'data/rc/Gustavo.PNG',
    cidadesRC: {
      '4301602': 'GUSTAVO' 
    }
  },
  // Adicione outras regiões aqui se necessário
  rs_norte: {
    view: [-29.0, -52.0],
    zoom: 6,
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA', // Use o ID correto
    geojsonPath: 'data/municipios-rs_norte.geojson',
    marcadorIcone: 'data/rc/marcador_padrao.svg',
    imagem: 'data/imagens/rs_norte.jpg',
    cidadesRC: {}
  },
  sc: {
    view: [-27.5, -50.0],
    zoom: 6,
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA', // Use o ID correto
    geojsonPath: 'data/municipios-sc.geojson',
    marcadorIcone: 'data/rc/marcador_padrao.svg',
    imagem: 'data/imagens/sc.jpg',
    cidadesRC: {}
  },
  pr: {
    view: [-25.5, -52.0],
    zoom: 6,
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA', // Use o ID correto
    geojsonPath: 'data/municipios-pr.geojson',
    marcadorIcone: 'data/rc/marcador_padrao.svg',
    imagem: 'data/imagens/pr.jpg',
    cidadesRC: {}
  },
  sp: {
    view: [-23.5, -46.6],
    zoom: 6,
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA', // Use o ID correto
    geojsonPath: 'data/municipios-sp.geojson',
    marcadorIcone: 'data/rc/marcador_padrao.svg',
    imagem: 'data/imagens/sp.jpg',
    cidadesRC: {}
  },
  ms: {
    view: [-20.5, -54.6],
    zoom: 6,
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA', // Use o ID correto
    geojsonPath: 'data/municipios-ms.geojson',
    marcadorIcone: 'data/rc/marcador_padrao.svg',
    imagem: 'data/imagens/ms.jpg',
    cidadesRC: {}
  }
};

// Função para mostrar o resumo do estado
function mostrarResumoEstado() {
  if (!dadosCSV || !filtroAnoSelecionado) return;
  
  const dadosFiltrados = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );
  
  if (dadosFiltrados.length === 0) {
    document.getElementById('dados-cidade').innerHTML = '<p>Sem dados para exibir com os filtros selecionados.</p>';
    return;
  }
  
  const totalQnt = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFat = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
  const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Gerar tabela de resumo
  let tabelaHTML = '<h3>Resumo do Estado</h3>';
  tabelaHTML += '<table>';
  tabelaHTML += '<thead><tr><th>Produto</th><th>Quantidade Vendida</th><th>Faturamento</th></tr></thead>';
  tabelaHTML += '<tbody>';
  
  // Agrupar por produto
  const produtosAgrupados = {};
  dadosFiltrados.forEach(item => {
    if (!produtosAgrupados[item.PRODUTO]) {
      produtosAgrupados[item.PRODUTO] = {
        qnt: 0,
        fat: 0
      };
    }
    produtosAgrupados[item.PRODUTO].qnt += parseFloat(item.QNT || 0);
    produtosAgrupados[item.PRODUTO].fat += parseFloat(item.FATURAMENTO || 0);
  });
  
  // Adicionar linhas para cada produto
  Object.entries(produtosAgrupados).forEach(([produto, dados]) => {
    tabelaHTML += `<tr>
      <td>${produto}</td>
      <td>${dados.qnt}</td>
      <td>${dados.fat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
    </tr>`;
  });
  
  // Linha de total
  tabelaHTML += `<tr style="font-weight: bold; background-color: #f0f0f0;">
    <td>TOTAL</td>
    <td>${totalQnt}</td>
    <td>${formatadoFAT}</td>
  </tr>`;
  
  tabelaHTML += '</tbody></table>';
  
  // Inserir a tabela na div de dados da cidade
  document.getElementById('dados-cidade').innerHTML = tabelaHTML;
}
