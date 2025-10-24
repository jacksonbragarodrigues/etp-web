import PartesEtpSelect from '../../../componentes-customizados-formio/partes-etp-select';

export default {
  basic: false,
  data: false,
  premium: false,
  customBasic: {
    title: 'Componentes Básicos',
    default: true,
    weight: 0,
    components: {
      notainterna: {
        title: 'Nota Interna',
        type: 'notainterna',
        key: 'notainterna',
        icon: 'fas fa-sticky-note',
        schema: {
          label: 'Nota Interna',
          type: 'notainterna',
          key: 'notainterna',
          modalEdit: false,
          hidden: true,
        },
      },

      botaoajuda: {
        title: 'Botão de Ajuda',
        type: 'botaoajuda',
        key: 'botaoajuda',
        icon: 'fas fa-question-circle',
        schema: {
          label: 'Botão de Ajuda',
          type: 'botaoajuda',
          key: 'botaoajuda',
          modalEdit: true,
        },
      },

      textoajuda: {
        title: 'Texto de Ajuda',
        type: 'botaoajuda',
        key: 'botaoajuda',
        icon: 'fas fa-question-circle',
        schema: {
          label: 'Texto de Ajuda',
          type: 'textoajuda',
          key: 'textoajuda',
          modalEdit: false,
        },
      },

      textfield: {
        title: 'Campo de Texto',
        type: 'textfield',
        key: 'textfield',
        icon: 'fas fa-terminal',
        schema: {
          title: 'Campo de Texto',
          type: 'textfield',
          key: 'textfield',
          inputFormat: 'html',
          validate: {
            required: true,
          },
        },
      },
      textarea: {
        title: 'Área de texto',
        type: 'textarea',
        key: 'textarea',
        icon: 'fas fa-font',
        schema: {
          title: 'Área de texto',
          type: 'textarea',
          key: 'textarea',
          editor: 'ckeditor',
          validate: {
            required: true,
          },
        },
      },
      datagrid: true,
      number: {
        title: 'Campo numérico',
        type: 'number',
        key: 'number',
        icon: 'fas fa-hashtag',
        schema: {
          title: 'Campo numérico',
          type: 'number',
          key: 'number',
          validate: {
            required: true,
          },
        },
      },
      password: false,
      checkbox: {
        title: 'Caixa de Seleção',
        type: 'checkbox',
        key: 'checkbox',
        icon: 'fas fa-check-square',
        schema: {
          title: 'Caixa de Seleção',
          type: 'checkbox',
          key: 'checkbox',
          validate: {
            required: true,
          },
        },
      },
      hidden: true,
      select: {
        title: 'Selecione',
        type: 'select',
        key: 'select',
        icon: 'fas fa-caret-down',
        schema: {
          title: 'Selecione',
          type: 'select',
          key: 'select',
          clearOnRefresh: true,
          searchEnabled: false,
          limit: 10000,
          validate: {
            required: true,
          },
        },
      },
      radio: {
        title: 'Botão de opção',
        type: 'radio',
        key: 'radio',
        icon: 'fas fa-dot-circle-o',
        schema: {
          title: 'Caixa de Seleção',
          type: 'radio',
          key: 'radio',
          validate: {
            required: true,
          },
        },
      },
      button: false,
      selectboxes: {
        title: 'Caixa de Seleção',
        type: 'selectboxes',
        key: 'selectboxes',
        icon: 'fas fa-check-square',
        schema: {
          title: 'Caixa de Seleção',
          type: 'selectboxes',
          key: 'selectboxes',
          validate: {
            required: true,
          },
        },
      },
      servidorselect: {
        title: 'Servidores',
        type: 'servidorselect',
        key: 'servidorselect',
        icon: 'fas fa-user',
        schema: {
          label: 'Servidores',
          type: 'servidorselect',
          key: 'servidorselect',
          clearOnRefresh: true,
          searchEnabled: false,
          limit: 10000,
          validate: {
            required: true,
          },
        },
      },
      processoSeiTextField: {
        title: 'Processo SEI',
        type: 'processoSeiTextField',
        key: 'processoSeiTextField',
        icon: 'fas fa-tasks',
        schema: {
          label: 'Processo SEI',
          type: 'processoSeiTextField',
          key: 'processoSeiTextField',
          validate: {
            required: true,
          },
        },
      },
      numeroEtpTextField: {
        title: 'Número ETP',
        type: 'numeroEtpTextField',
        key: 'numeroEtpTextField',
        icon: 'fas fa-tasks',
        schema: {
          label: 'Número ETP',
          type: 'numeroEtpTextField',
          key: 'numeroEtpTextField',
          validate: {
            required: true,
          },
        },
      },
      tipoconstratacaoselect: {
        title: 'Tipo Contratação',
        type: 'tipocontratacaoselect',
        key: 'tipocontratacaoselect',
        icon: 'fas fa-caret-down',
        schema: {
          label: 'Tipo Contratação',
          type: 'tipocontratacaoselect',
          key: 'tipocontratacaoselect',
          clearOnRefresh: true,
          searchEnabled: false,
          limit: 10000,
          validate: {
            required: true,
          },
        },
      },
      unidadeselect: {
        title: 'Unidades',
        type: 'unidadeselect',
        key: 'unidadeselect',
        icon: 'fas fa-caret-down',
        schema: {
          label: 'Unidades',
          type: 'unidadeselect',
          key: 'unidadeselect',
          clearOnRefresh: true,
          searchEnabled: false,
          limit: 10000,
          validate: {
            required: true,
          },
        },
      },
      partesetpselect: {
        title: 'Partes Etp',
        type: 'partesetpselect',
        key: 'partesetpselect',
        icon: 'fas fa-pizza-slice',
        schema: {
          label: 'Partes Etp',
          type: 'partesetpselect',
          key: 'partesetpselect',
          clearOnRefresh: true,
          searchEnabled: false,
          limit: 10000,
          validate: {
            required: true,
          },
        },
      },
    },
  },
  advanced: {
    title: 'Avançado',
    components: {
      email: true,
      url: true,
      tags: false,
      address: false,
      survey: false,
      currency: {
        title: 'Moeda',
        type: 'currency',
        key: 'currency',
        icon: 'fas fa-dollar-sign',
        schema: {
          title: 'Moeda',
          type: 'currency',
          key: 'currency',
          inputFormat: 'html',
          validate: {
            required: true,
          },
        },
      },
      signature: false,
      day: false,
      phoneNumber: true,
      datetime: false,
      time: false,
    },
  },
  layout: {
    title: 'Componentes de Layout',
    weight: 0,
    components: {
      panel: true,
      table: true,
      tabs: true,
      well: false,
      columns: true,
      fieldset: false,
      content: true,
      htmlelement: false,
    },
  },
};
