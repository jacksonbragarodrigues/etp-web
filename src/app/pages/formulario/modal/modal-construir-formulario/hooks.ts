import builderCustom from "./builderCustom";
import traducaoPt from "./traducaoPtBr";
import editFormCustom from "./editFormCustom";

export const hooks = {
  builder: builderCustom,
  language: 'pt',
  i18n: {
    pt: traducaoPt,
  },
  alerts: {
    submitMessage: 'Envio Completo', // Garante que a mensagem de submissão completa seja personalizada
  },
  styles: {
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  editForm: editFormCustom,
  hooks: {
    "changes": function(submission:any, callback:any) {
      console.log('change hooks');
      // Do something asynchronously.
      setTimeout(function() {
        // Callback with a possibly manipulated submission.
        callback(null, submission);
      }, 1000);
    }
  }
};
