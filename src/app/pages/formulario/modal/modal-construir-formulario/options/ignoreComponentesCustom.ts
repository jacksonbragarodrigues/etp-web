export default [
  {
    key: 'logic',
    ignore: true,
  },
  {
    key: 'layout',
    ignore: true,
  },
  {
    key: 'display',
    components: [
      {
        key: 'tableView',
        ignore: true,
      },
      {
        key: 'modalEdit',
        ignore: true,
      },
    ],
  },
  {
    key: 'data',
    components: [
      {
        key: 'data.url',
        ignore: true, // Oculta o campo URL para componentes de seleção
      },
      {
        key: 'dataSrc',
        ignore: true, // Oculta Data Source Type
      },
      {
        key: 'data.headers',
        ignore: true, // Oculta Request Headers
      },
      {
        key: 'defaultValue',
        ignore: true, // Oculta Default Value
      },
      {
        key: 'template',
        ignore: true, // Oculta Template Item
      },
      {
        key: 'valueProperty',
        ignore: true,
      },
      {
        key: 'disableLimit',
        ignore: true,
      },
      {
        key: 'searchDelay',
        ignore: true,
      },
      {
        key: 'filter',
        ignore: true,
      },
      {
        key: 'searchField',
        ignore: true,
      },
      {
        key: 'sort',
        ignore: true,
      },
      {
        key: 'idPath',
        ignore: true, // Oculta ID Path
      },
      {
        key: 'persistent',
        ignore: true, // Oculta ID Path
      },
      {
        key: 'dbIndex',
        ignore: true, // Oculta Database Index
      },
      {
        key: 'encrypted', // Substitua 'encrypted' pela chave correta de "Encrypted" se necessário
        ignore: true, // Oculta "Encrypted"
      },
      {
        key: 'dataPath', // Substitua 'encrypted' pela chave correta de "Encrypted" se necessário
        ignore: true, // Oculta "Encrypted"
      },
      {
        key: 'encrypted', // Substitua 'encrypted' pela chave correta de "Encrypted" se necessário
        ignore: true, // Oculta "Encrypted"
      },
      {
        key: 'clearOnRefresh',
        ignore: true,
      },
      {
        key: 'searchEnabled',
        ignore: false,
      },
      {
        key: 'customDefaultValuePanel',
        ignore: true,
      },
      {
        key: 'calculateValuePanel',
        ignore: true,
      },
      {
        key: 'limit',
        ignore: true,
      },
    ],
  },
];
