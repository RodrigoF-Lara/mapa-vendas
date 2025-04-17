const configuracoesRegioes = {
  'rs_sul': {
    id: 'rs_sul',
    nome: 'RS Sul',
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA',
    geojsonPath: 'municipios-RS SUL.geojson',
    view: [-30.0346, -51.2177],
    zoom: 6,
    cidadesRC: {
      '1400100': 'NABOR',
      '1504208': 'FABRÍCIO',
      // ... adicione todos os RCs da região Sul
    }
  },
  'rs_norte': {
    id: 'rs_norte',
    nome: 'RS Norte',
    planilhaId: 'ID_DA_PLANILHA_NORTE',
    geojsonPath: 'municipios-RS NORTE'.geojson'',
    view: [-28.5000, -53.0000],
    zoom: 6,
    cidadesRC: {
      // ... adicione os RCs da região Norte
    }
  }
  // Adicione as outras 19 regiões seguindo o mesmo padrão
};
