// Não declare novamente as variáveis que já foram declaradas em regioes-config.js
// As variáveis dadosCSV, map, filtrosAnosSelecionados, filtroMesSelecionado e regiaoAtual
// já são acessíveis pois o arquivo regioes-config.js é carregado antes

const planilhaGeralId = '1F2qUf0pvHFy1ccz384AuVWmb_qnFvHunhitrefoxRbs';

function carregarDadosGeral(callback) {
  const apiKey = 'AIzaSyAOPTDOnQXBBPj_hp0zzLBDL90KdV8Dzu0';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${planilhaGeralId}/values/A1:Z1000?key=${apiKey}`;
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
        if (callback) callback();
      } else {
        dadosCSV = [];
        if (callback) callback();
      }
    })
    .catch(() => {
      dadosCSV = [];
      if (callback) callback();
    });
}

// Inicializa o ícone do marcador
const rcIcon = L.icon({
  iconUrl: 'data/rc/marcador_Jeison.svg', // Ícone do RC
  iconSize: [35, 51], // Tamanho do ícone (ajuste conforme necessário)
  iconAnchor: [12, 41], // Ponto de ancoragem do ícone (ajuste conforme necessário)
  popupAnchor: [1, -34] // Ponto de ancoragem do popup (ajuste conforme necessário)
});

// Cole aqui:
const regioesInfo = Object.values(configuracoesRegioes).map(regiao => ({
  nome: regiao.nome,
  centro: regiao.centro,
  cor: regiao.cor
}));

// Inicializa o mapa
function initMap() {
  const config = regiaoAtual || {
    view: [-30.0346, -51.2177],
    zoom: 6
  };

  map = L.map('map').setView([-11.140, -53.275], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// Carregar a região
function carregarRegiao(regiaoId) {
  if (!regiaoId || !configuracoesRegioes[regiaoId]) {
    console.log('carregarRegiao: regiaoId vazio ou inválido, abortando.');
    return;
  }
  console.log('Carregando região:', regiaoId);
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;

  regiaoAtual = configuracoesRegioes[regiaoId];

  if (map) {
    map.remove(); // Destruir o mapa existente
  }

  // Reiniciar variáveis
  dadosCSV = [];
  filtrosAnosSelecionados = []; // Inicializa array vazio para anos selecionados
  filtroMesSelecionado = 'todos';

  // Limpar a tabela de vendas
  const tabelaContainer = document.getElementById('dados-cidade');
  if (tabelaContainer) {
    tabelaContainer.innerHTML = '<p>Selecione uma cidade para visualizar os dados.</p>';
  }

  // Criar novo mapa
  initMap();
  carregarDadosAPI();

  // Carregar dados das rotas planejadas
  if (typeof carregarDadosRotasPlanejadas === 'function') {
    carregarDadosRotasPlanejadas();
  }
}

// Carrega os dados da Google Sheets API
function carregarDadosAPI() {
  if (!regiaoAtual) return;
  
  const sheetId = regiaoAtual.planilhaId;
  const apiKey = 'AIzaSyAOPTDOnQXBBPj_hp0zzLBDL90KdV8Dzu0';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.values) {
        console.log('Dados da API:', data.values); // <-- LOG AQUI
        const headers = data.values[0];
        dadosCSV = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
        // LOG: Veja os primeiros itens já convertidos
        console.log('Primeiros itens do dadosCSV:', dadosCSV.slice(0, 5));
        popularFiltros();
        atualizarVisualizacao();
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

// Função para popular os checkboxes de anos e o dropdown de meses
function popularFiltros() {
  const anos = [...new Set(dadosCSV.map(item => item.ANO))].sort();
  console.log('popularFiltros - anos encontrados:', anos);
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))].sort((a, b) => a - b);

  let anoDefault = anos.includes('2025') ? '2025' : (anos.length > 0 ? anos[anos.length - 1] : null);
  filtrosAnosSelecionados = anoDefault ? [anoDefault] : [];

  const anosContainer = document.getElementById('anos-checkboxes');
  anosContainer.innerHTML = '';

  anos.forEach(ano => {
    const isChecked = filtrosAnosSelecionados.includes(ano);
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'ano-checkbox';
    checkboxDiv.innerHTML = `
      <input type="checkbox" id="ano-${ano}" value="${ano}" ${isChecked ? 'checked' : ''}>
      <label for="ano-${ano}" class="ano-checkbox-label">${ano}</label>
    `;
    anosContainer.appendChild(checkboxDiv);

    const checkbox = checkboxDiv.querySelector(`#ano-${ano}`);
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        filtrosAnosSelecionados.push(ano);
      } else {
        filtrosAnosSelecionados = filtrosAnosSelecionados.filter(a => a !== ano);
        if (filtrosAnosSelecionados.length === 0 && anos.length > 0) {
          filtrosAnosSelecionados = [anos[anos.length - 1]];
          anosContainer.querySelector(`#ano-${anos[anos.length - 1]}`).checked = true;
        }
      }
      atualizarLegendaAnos();
      atualizarVisualizacao();
    });
  });

  const selectMes = document.getElementById('filtro-mes');
  selectMes.innerHTML = `<option value="todos">Todos</option>` +
    meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');
  filtroMesSelecionado = 'todos';
  selectMes.value = 'todos';

  selectMes.addEventListener('change', () => {
    filtroMesSelecionado = selectMes.value;
    atualizarVisualizacao();
  });

  atualizarLegendaAnos();
  // REMOVA esta linha:
  // atualizarVisualizacao();
}

// Função para atualizar a legenda de cores dos anos
function atualizarLegendaAnos() {
  const legendaContainer = document.getElementById('legenda-anos');
  legendaContainer.innerHTML = '';
  
  if (filtrosAnosSelecionados.length === 0) {
    legendaContainer.innerHTML = '<span>Nenhum ano selecionado</span>';
    return;
  }
  
  filtrosAnosSelecionados.forEach(ano => {
    const cor = coresAnos[ano] || '#999999'; // Cor padrão se não estiver definida
    
    const legendaItem = document.createElement('div');
    legendaItem.className = 'legenda-item';
    legendaItem.innerHTML = `
      <span class="legenda-cor" style="background-color: ${cor};"></span>
      <span>${ano}</span>
    `;
    
    legendaContainer.appendChild(legendaItem);
  });
}

// Função principal para atualizar toda a visualização
function atualizarVisualizacao() {
  if (!map) return;

  // Limpar o mapa mantendo apenas a camada base
  map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) return;
    map.removeLayer(layer);
  });

  // Se não houver anos selecionados, apenas mostrar o mapa em branco
  if (filtrosAnosSelecionados.length === 0) {
    const resumoContainer = document.getElementById('resumo-estado');
    if (resumoContainer) {
      resumoContainer.innerHTML = '<p>Selecione pelo menos um ano para visualizar dados no mapa.</p>';
    }
    if (typeof mostrarRotasPlanejadas !== 'undefined' && mostrarRotasPlanejadas && typeof mostrarMarcadoresRotasPlanejadas === 'function') {
      mostrarMarcadoresRotasPlanejadas();
    }
    mostrarTotalMaquinasVendidasPorRegiao();
    // Limpar gráfico
    if (document.getElementById('grafico-mensal')) {
      document.getElementById('grafico-mensal').innerHTML = '';
    }
    return;
  }

  if (regiaoAtual) {
    carregarGeoJSONMultiplosAnos();
    gerarGraficoMensalMultiplosAnos();
    mostrarResumoEstadoComparativo();
  } else {
    // Se não houver região, só mostra os totais gerais
    mostrarTotalMaquinasVendidasPorRegiao();
    // Limpar resumo e gráfico e mostrar mensagem opcional
    const resumoContainer = document.getElementById('resumo-estado');
    if (resumoContainer) {
      resumoContainer.innerHTML = '<p>Selecione uma região para ver detalhes do resumo.</p>';
    }
    if (document.getElementById('grafico-mensal')) {
      document.getElementById('grafico-mensal').innerHTML = '';
    }
  }

  if (typeof mostrarRotasPlanejadas !== 'undefined' && mostrarRotasPlanejadas && typeof mostrarMarcadoresRotasPlanejadas === 'function') {
    mostrarMarcadoresRotasPlanejadas();
  }
}

// Carrega o GeoJSON com os limites dos municípios e aplica cores por ano
function carregarGeoJSONMultiplosAnos() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);
  
  fetch(caminhoGeoJSON)
    .then(response => response.json())
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Cria marcadores para os RCs específicos da região
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          const icone = L.icon({
            iconUrl: regiaoAtual.marcadorIcone,
            iconSize: [32, 32] // Tamanho do ícone do RC
          });

          // Exibe o marcador com a imagem do RC
          const popupContent = ` 
            <strong>${feature.properties.NM_MUN}</strong><br>
            <strong>📦 Quantidade Vendida:</strong> ${0}<br>
            <strong>💰 Faturamento:</strong> ${0}<br><br>
            <img src="${regiaoAtual.imagem}" alt="Imagem do local de vendas" width="200" />
          `;
          
          L.marker([centroid[1], centroid[0]], { icon: icone })
            .bindPopup(popupContent)
            .addTo(map);
        }
      });

      // Para cada cidade, verificar vendas em cada ano selecionado
      geojson.features.forEach(feature => {
        const codigoIBGE = feature.properties.CD_MUN;
        
        // Para cada ano selecionado, criar uma camada separada com cor diferente
        filtrosAnosSelecionados.forEach(ano => {
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === ano &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );
          
          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            const totalFat = vendasCidade.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
            const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            // Usar a cor específica para o ano
            const cor = coresAnos[ano] || '#999999';
            
            // Criar um polígono para este ano específico
            const layer = L.geoJSON(feature, {
              style: {
                fillColor: cor,
                fillOpacity: 0.7,
                weight: 1,
                color: 'black'
              }
            }).addTo(map);
            
            // Adicionar popup com informações do ano específico
            layer.bindPopup(`
              <strong>${feature.properties.NM_MUN} - ${ano}</strong><br>
              <strong>📦 Quantidade Vendida:</strong> ${totalQnt}<br>
              <strong>💰 Faturamento:</strong> ${formatadoFAT}<br>
            `);
            
            // Adicionar evento de clique para mostrar os dados na tabela
            layer.on('click', function() {
              exibirDadosNaTabela(vendasCidade, ano);
            });
          }
        });
      });
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
    });
}

// Função para exibir dados na tabela com os novos cabeçalhos
function exibirDadosNaTabela(vendas, ano) {
  const tabelaContainer = document.getElementById('dados-cidade');
  
  if (vendas.length === 0) {
    tabelaContainer.innerHTML = '<p>Sem dados para exibir com os filtros selecionados.</p>';
    return;
  }
  
  // Usar a cor específica para o ano no cabeçalho
  const cor = coresAnos[ano] || '#999999';
  
  let html = `<h3>Vendas de ${ano}</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr style="background-color: ${cor}20;">
            <th>NOTA</th>
            <th>PEDIDO</th>
            <th>CLIENTE</th>
            <th>CIDADE</th>
            <th>DESCRIÇÃO</th>
            <th>QNT</th>
            <th>FATURAMENTO</th>
            <th>DATA</th>
          </tr>
        </thead>
        <tbody>`;
  
  vendas.forEach(item => {
    html += `
          <tr>
            <td>${item.NOTA || ''}</td>
            <td>${item.PEDIDO || ''}</td>
            <td>${item.CLIENTE || ''}</td>
            <td>${item.CIDADE || ''}</td>
            <td>${item['DESCRIÇÃO'] || item.PRODUTO || ''}</td>
            <td>${item.QNT || '0'}</td>
            <td>${parseFloat((item.FATURAMENTO || '0').replace('.', '').replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${formatarData(item.DATA || '')}</td>
          </tr>`;
  });
  
  // Calcular totais
  const totalQnt = vendas.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFat = vendas.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
  const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Adicionar linha de total
  html += `
          <tr style="font-weight: bold; background-color: ${cor}30;">
            <td colspan="5">TOTAL</td>
            <td>${totalQnt}</td>
            <td>${formatadoFAT}</td>
            <td></td>
          </tr>`;
  
  html += `
        </tbody>
      </table>
    </div>`;
  
  tabelaContainer.innerHTML = html;
}

// Função para formatar data
function formatarData(dataString) {
  if (!dataString) return ''; // Retorna vazio se não houver data

  // Verificar se o formato é DD/MM/YYYY
  const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dataString.match(regexData);

  if (match) {
    // Extrair dia, mês e ano
    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10) - 1; // Meses no JavaScript são baseados em zero
    const ano = parseInt(match[3], 10);

    // Criar um objeto Date válido
    const data = new Date(ano, mes, dia);

    // Verificar se a data é válida
    if (!isNaN(data.getTime())) {
      return data.toLocaleDateString('pt-BR'); // Retorna no formato DD/MM/YYYY
    }
  }

  console.error("Data inválida:", dataString);
  return dataString; // Retorna a string original se não for válida
}

// Função para gerar o gráfico mensal com múltiplos anos
function gerarGraficoMensalMultiplosAnos() {
  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
  const traces = [];
  
  // Para cada ano selecionado, criar uma série de dados
  filtrosAnosSelecionados.forEach(ano => {
    const dadosFiltrados = dadosCSV.filter(item =>
      item.ANO === ano &&
      (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
    );
    
    const vendasPorMes = Array(12).fill(0);
    
    dadosFiltrados.forEach(item => {
      const mes = parseInt(item.MÊS) - 1;
      if (mes >= 0 && mes < 12) {
        vendasPorMes[mes] += parseFloat(item.QNT || 0);
      }
    });
    
    // Usar a cor específica para o ano
    const cor = coresAnos[ano] || '#999999';
    
    traces.push({
      x: nomesMeses,
      y: vendasPorMes,
      type: 'bar',
      name: ano,
      marker: { color: cor }
    });
  });
  
  const layout = {
    title: 'Máquinas Vendidas',
    xaxis: { title: 'Mês' },
    yaxis: { title: 'Quantidade' },
    barmode: 'group', // Agrupar barras lado a lado
    legend: { orientation: 'h', y: -0.2 }, // Legenda horizontal abaixo do gráfico
      annotations: traces.flatMap(trace => 
        trace.y.map((value, index) => ({
          x: trace.x[index],
          y: value , // Position the label at the center of the bar
          text: value.toString(),
          showarrow: false,
          font: { size: 12 },
          xanchor: 'center', // Center the label horizontally
          yanchor: 'top' // Center the label vertically
        }))
      )
    };
    
    Plotly.newPlot('grafico-mensal', traces, layout);
  }

 


// Função para mostrar o resumo do estado com comparação entre anos
function mostrarResumoEstadoComparativo() {
  const resumoContainer = document.getElementById('resumo-estado');
  
  if (!dadosCSV || filtrosAnosSelecionados.length === 0) {
    resumoContainer.innerHTML = '<p>Selecione pelo menos um ano para visualizar o resumo.</p>';
    return;
  }
  
  // Criar o resumo visual com ícones
  let resumoHTML = `
    <div class="resumo-estado-container">
      <div class="resumo-titulo">
        <span class="icone-resumo">📍</span> Total da Região ${regiaoAtual.nome}
      </div>
      
      <div class="resumo-estatisticas">
  `;
  
  // Para cada ano selecionado, criar um item de estatística
  filtrosAnosSelecionados.forEach(ano => {
    const dadosFiltrados = dadosCSV.filter(item =>
      item.ANO === ano &&
      (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
    );
    
    if (dadosFiltrados.length === 0) {
      return; // Pular este ano se não houver dados
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
    
    // Usar a cor específica para o ano
    const cor = coresAnos[ano] || '#999999';
    
    resumoHTML += `
      <div class="estatistica-item estatistica-item-ano" style="border-left-color: ${cor};">
        <span class="icone-estatistica">📅</span>
        <div class="estatistica-info">
          <div class="estatistica-label">Ano: ${ano}</div>
          <div class="estatistica-valor">
            📦 ${totalQnt} unidades<br>
            💰 ${formatadoFAT}<br>
            🏙️ ${numCidadesComVendas} cidades
          </div>
        </div>
      </div>
    `;
  });
  
  resumoHTML += `
      </div>
    </div>
  `;
  
  // Inserir o resumo visual na div acima do mapa
  resumoContainer.innerHTML = resumoHTML;
}
// ...existing code...

// Função genérica para adicionar um contorno
function adicionarContornoGeojson(path, style = {}) {
  fetch(path)
    .then(response => response.json())
    .then(geojson => {
      L.geoJSON(geojson, {
        style: Object.assign({
          color: '#3a86ff',
          weight: 3,
          fillOpacity: 0.1
        }, style)
      }).addTo(map);
    })
    .catch(error => {
      console.error('Erro ao carregar contorno:', path, error);
    });
}

// Função para carregar todos os contornos desejados
function carregarTodosContornos() {
  if (map) map.remove();
  map = L.map('map').setView([-19.140,-53.275], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // MAPAS DE CONTORNO REGIAO SUL
  adicionarContornoGeojson('data/geojson/COORD_SUL_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/RS_SUL_CONTORNO.geojson', { color: '#3a86ff' });
  adicionarContornoGeojson('data/geojson/RS_NORTE_CONTORNO.geojson', { color: '#3a86ff' });
  adicionarContornoGeojson('data/geojson/SC_CONTORNO.geojson', { color: '#3a86ff' });
  adicionarContornoGeojson('data/geojson/PR_CONTORNO.geojson', { color: '#3a86ff' });
  adicionarContornoGeojson('data/geojson/SP_CONTORNO.geojson', { color: '#3a86ff' });
  adicionarContornoGeojson('data/geojson/MS_CONTORNO.geojson', { color: '#3a86ff' });
  adicionarContornoGeojson('data/geojson/MT_LESTE_CONTORNO.geojson', { color: '#3a86ff' });

  // MAPAS DE CONTORNO REGIAO OESTE
  adicionarContornoGeojson('data/geojson/COORD_OESTE_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/MT_LESTE_CONTORNO.geojson', { color: '#ff6600' });
  adicionarContornoGeojson('data/geojson/MT_CENTRO_CONTORNO.geojson', { color: '#ff6600' });
  adicionarContornoGeojson('data/geojson/MT_OESTE_RO_CONTORNO.geojson', { color: '#ff6600' });

  // MAPAS DE CONTORNO REGIAO NORTE
  adicionarContornoGeojson('data/geojson/COORD_NORTE_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/BA_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/ES_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/TO_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/MA_PI_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/GO_MG_NORTE_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/GO_MG_SUL_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/SEALBA_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/PA_GRAO_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/PA_CONTORNO.geojson', { color: '#00b050' });
  adicionarContornoGeojson('data/geojson/RR_CONTORNO.geojson', { color: '#00b050' });


  mostrarTotalMaquinasVendidasPorRegiao();

  // Ajuste inicial dos marcadores conforme o zoom atual
  ajustarMarcadoresPorZoom();

  // Atualiza marcadores ao mudar o zoom
  map.on('zoomend', ajustarMarcadoresPorZoom);

  // Função interna para ajustar marcadores conforme zoom
  function ajustarMarcadoresPorZoom() {
    const zoom = map.getZoom();
    let scale = 1, translateY = 0, translateX = 0;
    let mostrarNome = zoom >= 6;

    if (zoom < 4) {
      scale = 0.5; translateY = -28; translateX = -28;
    } else if (zoom < 5) {
      scale = 0.7; translateY = -18; translateX = -18;
    } else if (zoom < 7) {
      scale = 0.9; translateY = -18; translateX = 0;
    } else if (zoom < 8) {
      scale = 1; translateY = -10; translateX = 0;
    } else if (zoom < 9) {
      scale = 1.1; translateY = -5; translateX = 0;
    } else {
      scale = 1; translateY = 0; translateX = 0;
    }

    if (window.markerTotalRegioes) {
      window.markerTotalRegioes.forEach(marker => {
        const el = marker.getElement();
        if (el) {
          if (mostrarNome) {
  el.innerHTML = `
    <span class="regiao-nome" style="color:${marker._regiaoCor}; font-weight:bold; white-space:nowrap; font-size:1.2em;">
      ${marker._regiaoNome}
    </span>
    <span class="regiao-total" style="color:${marker._regiaoCor}; font-weight:bold; margin-left:6px; font-size:1.5em;">
      ${marker._regiaoTotal}
    </span>
`;
} else {
  el.innerHTML = `
    <span class="regiao-total" style="color:${marker._regiaoCor}; font-weight:bold; font-size:1.5em;">
      ${marker._regiaoTotal}
    </span>
  `;
}
          el.querySelectorAll('span').forEach(span => {
            span.style.display = 'inline-block';
            span.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            span.style.transformOrigin = 'center center';
            // Log após ajuste de zoom
            console.log('AJUSTADO', span.className, window.getComputedStyle(span));
          });
        }
      });
    }
  }
} // <-- FECHA carregarTodosContornos

function mostrarTotalMaquinasVendidasPorRegiao() {
  console.log('Chamou mostrarTotalMaquinasVendidasPorRegiao');
  console.log('filtrosAnosSelecionados:', filtrosAnosSelecionados);
  console.log('filtroMesSelecionado:', filtroMesSelecionado);
  console.log('Primeiros itens do dadosCSV:', dadosCSV.slice(0, 5));

  // Remove marcadores antigos
  if (window.markerTotalRegioes) {
    window.markerTotalRegioes.forEach(marker => map.removeLayer(marker));
  }
  window.markerTotalRegioes = [];

  // Pega o zoom atual do mapa
  const zoomAtual = map.getZoom();
  const mostrarNome = zoomAtual >= 6;

  regioesInfo.forEach(regiao => {
    let total = 0;
    dadosCSV.forEach(item => {
      if (
        item['REGIÃO'] === regiao.nome &&
        (filtrosAnosSelecionados.length === 0 || filtrosAnosSelecionados.includes(item.ANO)) &&
        (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
      ) {
        total += parseFloat(item.QNT || 0);
      }
    });
    console.log(`Região: ${regiao.nome} | Total máquinas: ${total}`);

    // Monta o HTML do marcador conforme o zoom
    const html = mostrarNome
      ? `
        <span class="regiao-nome" style="color:${regiao.cor}; font-weight:bold; white-space:nowrap; font-size:1.2em; display:inline-block; transform:scale(1) translate(0px, -10px); transform-origin:center center;">
          ${regiao.nome.replace('_', ' ')}
        </span>
        <span class="regiao-total" style="color:${regiao.cor}; font-weight:bold; margin-left:6px; font-size:1.5em; display:inline-block; transform:scale(1) translate(0px, -10px); transform-origin:center center;">
          ${total}
        </span>
      `
      : `
        <span class="regiao-total" style="color:${regiao.cor}; font-weight:bold; font-size:1.5em; display:inline-block; transform:scale(1) translate(0px, -10px); transform-origin:center center;">
          ${total}
        </span>
      `;

    const marker = L.marker(regiao.centro, {
      icon: L.divIcon({
        className: 'total-rs-marker',
        html: html,
        iconAnchor: [0, 0]
      })
    }).addTo(map);

    setTimeout(() => {
      const el = marker.getElement();
      if (el) {
        const nome = el.querySelector('.regiao-nome');
        const total = el.querySelector('.regiao-total');
        if (nome) {
          console.log('INICIAL .regiao-nome:', window.getComputedStyle(nome));
          console.log('INICIAL .regiao-nome:', {
            fontSize: window.getComputedStyle(nome).fontSize,
            marginLeft: window.getComputedStyle(nome).marginLeft,
            transform: window.getComputedStyle(nome).transform
          });
        }
        if (total) {
          console.log('INICIAL .regiao-total:', window.getComputedStyle(total));
        }
      }
    }, 200); // Pequeno delay para garantir que o DOM foi atualizado

    // Guarde referência para atualizar depois
    marker._regiaoNome = regiao.nome.replace('_', ' ');
    marker._regiaoTotal = total;
    marker._regiaoCor = regiao.cor;
    window.markerTotalRegioes.push(marker);
  });

  // Ajuste visual inicial dos marcadores conforme o zoom atual
  if (typeof ajustarMarcadoresPorZoom === 'function') {
    ajustarMarcadoresPorZoom();
  }
}


function initApp() {
  const seletorRegiao = document.getElementById('filtro-regiao');
  if (seletorRegiao) {
    const regiaoSalva = localStorage.getItem('regiaoSelecionada');
    if (regiaoSalva) {
      seletorRegiao.value = regiaoSalva;
      carregarRegiao(regiaoSalva);
    } else {
      // Carregar dados gerais e só então mostrar contornos e filtros
      carregarDadosGeral(() => {
  console.log('Dados gerais carregados:', dadosCSV.length, 'itens');
  carregarTodosContornos();
  popularFiltros();
  atualizarVisualizacao(); // <-- Adicione esta linha!
  console.log('Anos disponíveis:', [...new Set(dadosCSV.map(item => item.ANO))]);
  console.log('Anos selecionados:', filtrosAnosSelecionados);
});
    }

    seletorRegiao.addEventListener('change', function() {
  const regiaoId = this.value;
  if (regiaoId) {
    localStorage.setItem('regiaoSelecionada', regiaoId);
    carregarRegiao(regiaoId);
  } else {
    localStorage.removeItem('regiaoSelecionada');
    carregarDadosGeral(() => {
      carregarTodosContornos();
      popularFiltros();
    });
  }
});
  } else {
    // Caso não exista seletor de região, carregar dados gerais ao abrir
    carregarDadosGeral(() => {
      carregarTodosContornos();
      popularFiltros();
    });
  }

  // Adicionar funcionalidade de expandir/recolher o painel lateral
  document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-panel');
    const appContainer = document.querySelector('.app-container');
    if (toggleButton && appContainer) {
      toggleButton.addEventListener('click', () => {
        appContainer.classList.toggle('panel-collapsed');
        // Alterar o ícone do botão
        const icon = toggleButton.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = appContainer.classList.contains('panel-collapsed') ? '⮜' : '⮞';
        }
      });
    }
  });
}
document.addEventListener('DOMContentLoaded', initApp);