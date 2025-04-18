export function carregarDadosAPI(sheetId, apiKey, callback) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados da API: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.values) {
        const headers = data.values[0];
        const dadosCSV = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });

        // Executar a função de callback com os dados processados
        if (callback) {
          callback(dadosCSV);
        }
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}