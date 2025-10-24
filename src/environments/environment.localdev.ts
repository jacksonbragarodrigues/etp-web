const appInfo = require('../../package.json');

export const environment = {
  production: true,
  permission: true,
  menuCa: false,
  formioTipo: 'BUILDER',
  formioLimitReturnAPI: 5, //o valor deve ser 5 ou 10000
  etpPartesId: 1,
  ambiente: '-dev.web.stj.jus.br',
  apiFormulario: 'http://localhost:8080/api/etp-service',
  pathFormularioWeb: 'https://etp-dev.web.stj.jus.br/',
  bloqueioTimeOut: 10,

  controleAcesso: {
    segurancaHost: 'https://ca2-dev.web.stj.jus.br/api',
    endPointCa: 'auth/oauth/token',
    urlLogin: 'login',
    idSistema: 6,
    urlmodulo: 'lib/',
    idAplicaoesPermitidas: [132, 133, 134, 136, 139],
  },

  // Configuração da validação de browser
  browser: [
    {
      type: 'MS-Edge-Chromium',
      version: '12',
      aborta: false,
      site: 'https://www.microsoft.com/pt-br/edge',
    },
    {
      type: 'Firefox',
      version: '38',
      aborta: false,
      site: 'https://support.mozilla.org/en-US/kb/update-firefox-latest-release',
    },
    {
      type: 'Chrome',
      version: '45',
      aborta: false,
      site: 'https://support.google.com/chrome/answer/95414?co=GENIE.Platform%3DDesktop&hl=pt-BR',
    },
    {
      type: 'ie',
      version: '10',
      aborta: false,
      site: 'https://www.microsoft.com/pt-br/edge',
    },
    {
      type: 'opera',
      version: '30',
      aborta: false,
      site: 'https://www.opera.com/pt/download',
    },
    {
      type: 'safari',
      version: '9',
      aborta: false,
      site: 'https://support.apple.com/pt-br/HT204416',
    },
  ],
  log: {
    appName: appInfo.name,
    appVersion: appInfo.version,
    // Informar o email de destino, caso deseje receber um email do erro
    emailDestino: '',
    emailOrigem: '',
    ativo: true,
    erroApi: 'https://log-erro-dev.web.stj.jus.br/api/log-service/',
  },
};
