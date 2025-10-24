// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const appInfo = require('../../package.json');

export const environment = {
  production: false,
  menuCa: false,
  ambiente: '-AMBIENTE.web.stj.jus.br',
  formioTipo: 'BUILDER',
  formioLimitReturnAPI: 5, //o valor deve ser 5 ou 10000
  etpPartesId: 1,
  permission: true,
  apiFormulario: 'https://etp-AMBIENTE.web.stj.jus.br/api/etp-service',
  pathFormularioWeb: 'https://etp-AMBIENTE.web.stj.jus.br/',
  bloqueioTimeOut: 10,

  controleAcesso: {
    segurancaHost: 'https://ca2-AMBIENTE.web.stj.jus.br/api',
    endPointCa: 'auth/oauth/token',
    urlLogin: 'login',
    urlmodulo: 'lib/',
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
    erroApi: 'https://log-erro-AMBIENTE.web.stj.jus.br/api/log-service/',
  },
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
