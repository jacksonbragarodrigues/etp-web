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
        key: 'defaultValue',
        ignore: true, // Oculta Default Value
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
        key: 'data.dataPath',
        ignore: true, // Oculta Data Path
      },
      {
        key: 'data.storageType',
        ignore: true, // Oculta Storage Type
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
        key: 'allowMultipleMasks',
        ignore: true, // Oculta "Allow Multiple Masks"
      },
      {
        key: 'encrypted',
        ignore: true, // Oculta "Encrypted"
      },
      {
        key: 'inputFormat',
        ignore: true,
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
  {
    key: 'validation',
    components: [
      {
        key: 'validateOn',
        ignore: true, // Oculta Default Value
      },
    ],
  },
];
