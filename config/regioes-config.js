// Configurações das regiões
const configuracoesRegioes = {
  'rs_sul': {
    id: 'rs_sul',
    nome: 'RS SUL',
    centro: [-30.787,-53.747], // Adicione esta linha
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA',
    geojsonPath: 'data/geojson/municipios-RS_Sul.geojson',
    view: [-30.0346, -51.2177],
    zoom: 6,
    marcadorIcone: 'data/rc/marcador_Gustavo.svg',
    imagem: 'data/rc/Gustavo.png',
    cidadesRC: {'4301602': 'GUSTAVO' }
           },
  
'rs_norte': {
    id: 'rs_norte',
    nome: 'RS NORTE',
    centro: [-28.708,-52.934], // Adicione esta linha
    planilhaId: '1zxsWdSrPsPV6zqvNk0cv8zUosvntcZPGBMT9oLiB21s',
    geojsonPath: 'data/geojson/municipios-RS_Norte.geojson',
    view: [-29.5000, -53.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Leandro.svg',
    imagem: 'data/rc/Leandro.png',
    cidadesRC: {'4304705': 'LEANDRO'}
            },
  
  'sc': {
    id: 'sc',
    nome: 'SC',
    centro: [-27.2423, -50.2189], // Adicione esta linha
    planilhaId: '1aWYSIjBBS6q6TaLlDETakqz_QUQrg3dR8nVwKYQlyHY',
    geojsonPath: 'data/geojson/municipios-SC.geojson',
    view: [-27.2423, -50.2189],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.png',
    cidadesRC: {'4209003': 'LEONARDO'}
        },
  
  'pr': {
    id: 'pr',
    nome: 'PR',
    centro: [-24.6603,-51.6271], // Adicione esta linha
    planilhaId: '1_DlY-t96oZ5HMctUv40MjZSFPQNBkr0XmGglUQ5kBn0',
    geojsonPath: 'data/geojson/municipios-PR.geojson',
    view: [-24.7935, -50.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Israel.svg',
    imagem: 'data/rc/Israel.png',
    cidadesRC: {'4104808': 'ISRAEL'}
          },
  
  'sp': {
    id: 'sp',
    nome: 'SP',
    centro: [-22.2933,-48.7120], // Adicione esta linha
    planilhaId: '1iIyNSJSvZO53txewSIdgulgOQr9LkKVlKC4jYdleH1U',
    geojsonPath: 'data/geojson/municipios-SP.geojson',
    view: [-22.1500, -48.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Andre.svg',
    imagem: 'data/rc/Andre.png',
    cidadesRC: {'3529005': 'ANDRE'}
    },
  
  'ms': {
    id: 'ms',
    nome: 'MS',
    centro: [-20.3726,-54.8518], // Adicione esta linha
    planilhaId: '1UCqKvj-R5QRhRaHo6bsLGhWRiLvlw2txPQsPeHG1-rE',
    geojsonPath: 'data/geojson/municipios-MS.geojson',
    view: [-20.4697, -54.6201],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5003702': 'GRAZIAN'}
  },

  'mt_leste': {
    id: 'mt_leste',
    nome: 'MT LESTE',
    centro: [-13.558,-52.901], // Adicione esta linha
    planilhaId: '15tV0TsG2RUkEI3WI4C0epHq7rQF9lovA37FnM0mmbGQ',
    geojsonPath: 'data/geojson/municipios-MT_LESTE.geojson',
    view: [-13.558,-52.901],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5107040': 'GLESON'}
  },

  'mt_centro': {
    id: 'mt_centro',
    nome: 'MT CENTRO',
    centro: [],
    planilhaId: '',
    geojsonPath: 'data/geojson/municipios-MT_CENTRO.geojson',
    view: [],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5105259': 'JOAO'}
  },

  'mt_oeste_ro': {
    id: 'mt_oeste_ro',
    nome: 'MT OESTE RO',
    centro: [],
    planilhaId: '',
    geojsonPath: 'data/geojson/municipios-MT_OESTE_RO.geojson',
    view: [],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'RODRIGO'}
  }
};

// Esta função não é mais usada diretamente, foi substituída por mostrarResumoEstadoComparativo()
// Mantida apenas para compatibilidade com código existente
function mostrarResumoEstado() {
  mostrarResumoEstadoComparativo();
}
