// Configurações das regiões
const configuracoesRegioes = {
//COORDENAÇÃO SUL
  'rs_sul': {
    id: 'rs_sul',
    nome: 'RS SUL',
    centro: [-30.787,-53.747],
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
    centro: [-28.708,-52.934],
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
    centro: [-27.2423, -50.2189],
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
    centro: [-24.6603,-51.6271],
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
    centro: [-22.2933,-48.7120],
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
    centro: [-20.3726,-54.8518],
    planilhaId: '1UCqKvj-R5QRhRaHo6bsLGhWRiLvlw2txPQsPeHG1-rE',
    geojsonPath: 'data/geojson/municipios-MS.geojson',
    view: [-20.4697, -54.6201],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5003702': 'GRAZIAN'}
  },
//COORDENAÇÃO OESTE
  'mt_leste': {
    id: 'mt_leste',
    nome: 'MT LESTE',
    centro: [-13.493,-52.966],
    planilhaId: '15tV0TsG2RUkEI3WI4C0epHq7rQF9lovA37FnM0mmbGQ',
    geojsonPath: 'data/geojson/municipios-MT_LESTE.geojson',
    view: [-13.493,-52.966],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5107040': 'GLESON'}
  },

  'mt_centro': {
    id: 'mt_centro',
    nome: 'MT CENTRO',
    centro: [-13.140,-57.112],
    planilhaId: '1EYT5gf07pKww6w3YMr_Dzlvv2hMDSe758z2L80Xps1s',
    geojsonPath: 'data/geojson/municipios-MT_CENTRO.geojson',
    view: [-13.140,-55.812],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5105259': 'JOAO'}
  },

  'mt_oeste_ro': {
    id: 'mt_oeste_ro',
    nome: 'MT OESTE_RO',
    centro: [-11.738,-60.555],
    planilhaId: '1zHTb1tizDoJtkUwHvEKhDpl05byjUwimchAg72JkpKg',
    geojsonPath: 'data/geojson/municipios-MT_OESTE_RO.geojson',
    view: [-11.738,-60.555],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'RODRIGO'}
  },
//COORDENAÇÃO NORTE
'ba': {
    id: 'ba',
    nome: 'BA',
    centro: [-12.738,-43.555],
    planilhaId: '1a9IM_cYR-rr4FaZ956qZW5gv7T-zWU0pQLx9tt95gp0',
    geojsonPath: 'data/geojson/municipios-BA.geojson',
    view: [-12.738,-43.555],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'PENINHA'}
  },

  'es': {
    id: 'es',
    nome: 'ES',
    centro: [-19.238,-40.555],
    planilhaId: '1e7EmS1D5Q2AY3opWaJnwoq_vmH8CfbvKEp9iAX2E-Fk',
    geojsonPath: 'data/geojson/municipios-ES.geojson',
    view: [-19.238,-40.555],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'PAULO'}
  },

  'to': {
    id: 'to',
    nome: 'TO',
    centro: [-10.000,-49.000],
    planilhaId: '1AO5-9DplOAnWDnO9mxOQ-RRqtBGCLwoAJPwT96XXNuE',
    geojsonPath: 'data/geojson/municipios-TO.geojson',
    view: [-10.000,-49.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'GABRIEL'}
  },

  'ma_pi': {
    id: 'ma_pi',
    nome: 'MA_PI',
    centro: [-7.000,-45.000],
    planilhaId: '1FZ5q8ePheTURypt598ECKUMACR604-8T8EKFPQA3dJ4',
    geojsonPath: 'data/geojson/municipios-MA_PI.geojson',
    view: [-7.000,-45.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'CLAUDEMIR'}
  },

  'go_mg_norte': {
    id: 'go_mg_norte',
    nome: 'GO_MG NORTE',
    centro: [-17.000,-45.000],
    planilhaId: '1f12ESE7EdVcpa9W6T2VlgcDr-1nydFZqQYHUUicgU2w',
    geojsonPath: 'data/geojson/municipios-GO_MG_NORTE.geojson',
    view: [-7.000,-45.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'RENNAN'}
  },

  'go_mg_sul': {
    id: 'go_mg_sul',
    nome: 'GO_MG SUL',
    centro: [-18.500,-49.000],
    planilhaId: '1UTMM8bIpG2mWARFVhS5HkjVDiC1Z5BkYds-cP30XR9Q',
    geojsonPath: 'data/geojson/municipios-GO_MG_SUL.geojson',
    view: [-7.000,-45.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'RENAN'}
  },

  'sealba': {
    id: 'sealba',
    nome: 'SEALBA',
    centro: [-8.500,-38.000],
    planilhaId: '1iy_D8Ce1bJXsYlN701rxbAOWDuZNqaHsTQkGnd3zLf8',
    geojsonPath: 'data/geojson/municipios-SEALBA.geojson',
    view: [-7.000,-45.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'ESCOURA'}
  },

  'pa_grao': {
    id: 'pa_grao',
    nome: 'PA_GRAO',
    centro: [-4.500,-52.000],
    planilhaId: '17lAKifwBfAtM2pzs_-CiZHXkwpwU7CAH5jWYhjQ1lnE',
    geojsonPath: 'data/geojson/municipios-PA_GRAO.geojson',
    view: [-7.000,-45.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'RICARDO'}
  },

  'pa_pecuaria': {
    id: 'pa_pecuaria',
    nome: 'PA_PECUARIA',
    centro: [-5.500,-55.000],
    planilhaId: '14FYuVWciKL-Wzz4fLFq16U_uzswUUATVWMjgF7Gg5QM',
    geojsonPath: 'data/geojson/municipios-PA_PECUARIA.geojson',
    view: [-7.000,-45.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'FABRICIO'}
  },

  'rr': {
    id: 'rr',
    nome: 'RR',
    centro: [0.500,-55.000],
    planilhaId: '10J5TOpxwIpoiSWQifKIDNdCsyFDfZYcoiWNLz1D_d7U',
    geojsonPath: 'data/geojson/municipios-RR.geojson',
    view: [-7.000,-45.000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Grazian.svg',
    imagem: 'data/rc/Grazian.png',
    cidadesRC: {'5102637': 'NABOR'}
  },
};

// Esta função não é mais usada diretamente, foi substituída por mostrarResumoEstadoComparativo()
// Mantida apenas para compatibilidade com código existente
function mostrarResumoEstado() {
  mostrarResumoEstadoComparativo();
}
