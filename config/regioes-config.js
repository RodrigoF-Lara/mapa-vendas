// Configurações das regiões
const configuracoesRegioes = {
  'rs_sul': {
    id: 'rs_sul',
    nome: 'RS Sul',
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA',
    geojsonPath: 'data/geojson/municipios-RS_Sul.geojson',
    view: [-30.0346, -51.2177],
    zoom: 6,
    marcadorIcone: 'data/rc/marcador_Gustavo.svg',
    imagem: 'data/rc/Gustavo.PNG',
    cidadesRC: {'4301602': 'GUSTAVO' }
           },
  
'rs_norte': {
    id: 'rs_norte',
    nome: 'RS Norte',
    planilhaId: '1zxsWdSrPsPV6zqvNk0cv8zUosvntcZPGBMT9oLiB21s',
    geojsonPath: 'data/geojson/municipios-RS_Norte.geojson',
    view: [-29.5000, -53.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'4304705': 'LEANDRO'}
            },
  
  'sc': {
    id: 'sc',
    nome: 'SC',
    planilhaId: '1aWYSIjBBS6q6TaLlDETakqz_QUQrg3dR8nVwKYQlyHY',
    geojsonPath: 'data/geojson/municipios-SC.geojson',
    view: [-27.2423, -50.2189],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'4209003': 'LEONARDO'}
        },
  
  'pr': {
    id: 'pr',
    nome: 'PR',
    planilhaId: '1_DlY-t96oZ5HMctUv40MjZSFPQNBkr0XmGglUQ5kBn0',
    geojsonPath: 'data/geojson/municipios-PR.geojson',
    view: [-24.7935, -50.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'4104808': 'ISRAEL'}
          },
  
  'sp': {
    id: 'sp',
    nome: 'SP',
    planilhaId: '1iIyNSJSvZO53txewSIdgulgOQr9LkKVlKC4jYdleH1U',
    geojsonPath: 'data/geojson/municipios-SP.geojson',
    view: [-22.1500, -48.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Andre.svg',
    imagem: 'data/rc/Andre.PNG',
    cidadesRC: {'3529005': 'ANDRE'}
    },
  
  'ms': {
    id: 'ms',
    nome: 'MS',
    planilhaId: '1UCqKvj-R5QRhRaHo6bsLGhWRiLvlw2txPQsPeHG1-rE',
    geojsonPath: 'data/geojson/municipios-MS.geojson',
    view: [-20.4697, -54.6201],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'5003702': 'GRAZIAN'}
  }
};

// Função para mostrar o resumo do estado
function mostrarResumoEstado() {
  // Verificar se temos dados e se o ano está selecionado
  // Se filtroAnoSelecionado estiver vazio, use o ano atual
  if (!dadosCSV || dadosCSV.length === 0) return;
  
  if (!filtroAnoSelecionado || filtroAnoSelecionado === '') {
    const anos = [...new Set(dadosCSV.map(item => item.ANO))].sort();
    if (anos.length > 0) {
      const anoAtual = new Date().getFullYear().toString();
      // Tenta usar o ano atual, ou o último ano disponível
      filtroAnoSelecionado = anos.includes(anoAtual) ? anoAtual : anos[anos.length - 1];
      
      // Atualiza o select do ano se existir
      const selectAno = document.getElementById('filtro-ano');
      if (selectAno) {
        selectAno.value = filtroAnoSelecionado;
      }
    } else {
      return; // Não há anos disponíveis
    }
  }
  
  const dadosFiltrados = dadosCSV.filter(item =>
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );
  
  if (dadosFiltrados.length === 0) {
    document.getElementById('resumo-estado').innerHTML = '<p>Sem dados para exibir com os filtros selecionados.</p>';
    document.getElementById('dados-cidade').innerHTML = '';
    return;
  }
  
  const totalQnt = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFat = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
  const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Calcular número de cidades com vendas
  const cidadesComVendas = new Set();
  dadosFiltrados.forEach(item => {
    if (item.CIDADE) {
      cidadesComVendas.add(item.CIDADE);
    }
  });
  const numCidadesComVendas = cidadesComVendas.size;
  
  // Criar o resumo visual com ícones para exibir acima do mapa
  let resumoHTML = `
    <div class="resumo-estado-container">
      <div class="resumo-titulo">
        <span class="icone-resumo">📍</span> Total do Estado do ${regiaoAtual.nome}
      </div>
      
      <div class="resumo-estatisticas">
        <div class="estatistica-item">
          <span class="icone-estatistica">📦</span>
          <div class="estatistica-info">
            <div class="estatistica-label">Quantidade Vendida:</div>
            <div class="estatistica-valor">${totalQnt}</div>
          </div>
        </div>
        
        <div class="estatistica-item">
          <span class="icone-estatistica">💰</span>
          <div class="estatistica-info">
            <div class="estatistica-label">Faturamento Total:</div>
            <div class="estatistica-valor">${formatadoFAT}</div>
          </div>
        </div>
        
        <div class="estatistica-item">
          <span class="icone-estatistica">🏙️</span>
          <div class="estatistica-info">
            <div class="estatistica-label">Número de Cidades com Vendas:</div>
            <div class="estatistica-valor">${numCidadesComVendas}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Inserir o resumo visual na div acima do mapa
  document.getElementById('resumo-estado').innerHTML = resumoHTML;
  
  // Criar a tabela de resumo por produto para a div de dados da cidade
  let tabelaHTML = '<h3>Resumo por Produto</h3>';
  tabelaHTML += '<div class="table-container"><table>';
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
  
  tabelaHTML += '</tbody></table></div>';
  
  // Inserir a tabela na div de dados da cidade
  document.getElementById('dados-cidade').innerHTML = tabelaHTML;
}
