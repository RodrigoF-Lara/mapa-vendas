// table.js
export function mostrarTabela(dadosCSV, codigoIBGE, filtroAnoSelecionado, filtroMesSelecionado) {
  const vendas = dadosCSV.filter(item =>
    item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
    item.ANO === filtroAnoSelecionado &&
    (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
  );

  const container = document.getElementById('dados-cidade');

  if (vendas.length === 0) {
    container.innerHTML = '<p>Nenhuma venda para a cidade nesse filtro.</p>';
    return;
  }

  const totalQNT = vendas.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFAT = vendas.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
  const formatadoFAT = totalFAT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let html = `
    <p><strong>📦 Total de Quantidade Vendida:</strong> ${totalQNT}</p>
    <p><strong>💰 Total de Faturamento:</strong> ${formatadoFAT}</p>
    <div class="table-container">
      <table>
        <thead>
          <tr>
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
            <td>${item.NOTA}</td>
            <td>${item.PEDIDO}</td>
            <td>${item.CLIENTE}</td>
            <td>${item.CIDADE}</td>
            <td>${item['DESCRIÇÃO']}</td>
            <td>${item.QNT}</td>
            <td>${parseFloat((item.FATURAMENTO || '0').replace('.', '').replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${item.DATA}</td>
          </tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}
