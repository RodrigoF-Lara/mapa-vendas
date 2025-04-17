// api.js
export function carregarDadosAPI(sheetId, apiKey) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
  
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.values) {
        const headers = data.values[0];
        return data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
      } else {
        throw new Error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}
