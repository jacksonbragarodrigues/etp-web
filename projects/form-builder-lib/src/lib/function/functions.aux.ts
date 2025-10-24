export default class FunctionAux {
  createKeyApiPanel(event: any) {
    if (event.type === 'updateComponent') {
      let label = this.trimReplaceWhiteSpaceByUnderscore(event.component.title);
      label = 'painel_' + label + '_painel';
      label = this.removeStopWordsAndSplitUnderscore(label);
      event.component.key = label.toUpperCase();
    }
  }

  createKeyApiValues(event: any) {
    if (event.type === 'updateComponent') {
      let contador = 0;
      event.component.values.forEach((item: any) => {
        contador++;
        let label = this.trimReplaceWhiteSpaceByUnderscore(item.label);
        label = 'par_' + contador + '_' + label + '_par';
        label = this.removeStopWordsAndSplitUnderscore(label);
        item.value = label.toUpperCase();
      });
    }
  }

  createKeyApiValue(label: any): string {
        label = this.trimReplaceWhiteSpaceByUnderscore(label);
        label = 'par_' + label + '_par';
        label = this.removeStopWordsAndSplitUnderscore(label);
        return label.toUpperCase();
    
  }

  createKeyApiTabs(event: any) {
    if (event.type === 'updateComponent') {
      let contador = 0;
      event.component.components.forEach((item: any) => {
        contador++;
        let label = this.trimReplaceWhiteSpaceByUnderscore(item.label);
        label = 'aba_' + contador + '_' + label + '_aba';
        label = this.removeStopWordsAndSplitUnderscore(label);
        item.key = label.toUpperCase();
      });
    }
  }

  removeBold(component: any) {
    component.label = component.label.replace(/<\/?b>/g, '');
  }

  generateBold(event: any) {
    const { component } = event;
    if (
      !component ||
      component.type === 'content' ||
      component.type === 'hidden'
    ) {
      return;
    }

    this.removeBold(component);
    component.label = `<b>${component.label}</b>`;
  }

  createKeyApi(label: string, id:string, key:string ):string {
    // if (event.type === 'updateComponent') {
    //   if (event.component.type === 'processoSeiTextField') {
    //     event.component.key = 'PAR_PROCESSO_SEI_PAR';
    //   } else if (event.component.type === 'numeroEtpTextField') {
    //     event.component.key = 'PAR_NUMERO_ETP_PAR';
    //   } else if (event.component.type === 'tipocontratacaoselect') {
    //     event.component.key = 'PAR_TIPO_CONTRATACAO_PAR';
    //   } else if (event.component.type === 'partesetpselect') {
    //     event.component.key = 'PAR_PARTES_ETP_PAR';
    //   } else {
        label = this.trimReplaceWhiteSpaceByUnderscore(label);
        label = 'par_' + label + '_' + id + '_par';
        label = this.removeStopWordsAndSplitUnderscore(label);
       // const regex = /^PAR_.*_PAR$/;
        //if (!regex.test(key)) {
           return label.toUpperCase();
        //} 
         // return key;
    //  }
  //  }
  }

  removeStopWordsAndSplitUnderscore(texto: string) {
    texto = texto.replace(/_+/g, '_');
    texto = this.removerStopWords(texto);
    const partes = texto.split('_');
    if (partes.length >= 12) {
      const subPartes = partes.slice(0, 6);
      texto = subPartes.join('_') + '_PAR';
    }
    return texto;
  }

  trimReplaceWhiteSpaceByUnderscore(texto: string) {
    texto = texto.replaceAll('<b>', '');
    texto = texto.replaceAll('</b>', '');
    return this.removeAccents(texto)
      .trim()
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/[^a-z0-9_]+/g, '');
  }

  removerStopWords(texto: string) {
    // Lista de stop words em português
    const stopWords = [
      'a',
      'e',
      'o',
      'que',
      'de',
      'do',
      'da',
      'em',
      'um',
      'para',
      'é',
      'com',
      'não',
      'uma',
      'os',
      'no',
      'se',
      'na',
      'por',
      'mais',
      'as',
      'dos',
      'como',
      'mas',
      'foi',
      'ao',
      'ele',
      'das',
      'tem',
      'à',
      'seu',
      'sua',
      'ou',
      'ser',
      'quando',
      'muito',
      'há',
      'nos',
      'já',
      'está',
      'eu',
      'também',
      'só',
      'pelo',
      'pela',
      'até',
      'isso',
      'ela',
      'entre',
      'era',
      'depois',
      'sem',
      'mesmo',
      'aos',
      'ter',
      'seus',
      'quem',
      'nas',
      'me',
      'esse',
      'eles',
      'estão',
      'você',
      'tinha',
      'foram',
      'essa',
      'num',
      'nem',
      'suas',
      'meu',
      'às',
      'minha',
      'têm',
      'numa',
      'pelos',
      'elas',
      'havia',
      'seja',
      'qual',
      'será',
      'nós',
      'tenho',
      'lhe',
      'deles',
      'essas',
      'esses',
      'pelas',
      'este',
      'fosse',
      'dele',
      'tu',
      'te',
      'vocês',
      'vos',
      'lhes',
      'meus',
      'minhas',
      'teu',
      'tua',
      'teus',
      'tuas',
      'nosso',
      'nossa',
      'nossos',
      'nossas',
      'dela',
      'delas',
      'esta',
      'estes',
      'estas',
      'aquele',
      'aquela',
      'aqueles',
      'aquelas',
      'isto',
      'aquilo',
      'estou',
      'está',
      'estamos',
      'estão',
      'estive',
      'esteve',
      'estivemos',
      'estiveram',
      'estava',
      'estávamos',
      'estavam',
      'estivera',
      'estivéramos',
      'esteja',
      'estejamos',
      'estejam',
      'estivesse',
      'estivéssemos',
      'estivessem',
      'estiver',
      'estivermos',
      'estiverem',
      'hei',
      'há',
      'havemos',
      'hão',
      'houve',
      'houvemos',
      'houveram',
      'houvera',
      'houvéramos',
      'haja',
      'hajamos',
      'hajam',
      'houvesse',
      'houvéssemos',
      'houvessem',
      'houver',
      'houvermos',
      'houverem',
      'houverei',
      'houverá',
      'houveremos',
      'houverão',
      'houveria',
      'houveríamos',
      'houveriam',
      'sou',
      'somos',
      'são',
      'era',
      'éramos',
      'eram',
      'fui',
      'foi',
      'fomos',
      'foram',
      'fora',
      'fôramos',
      'seja',
      'sejamos',
      'sejam',
      'fosse',
      'fôssemos',
      'fossem',
      'for',
      'formos',
      'forem',
      'serei',
      'será',
      'seremos',
      'serão',
      'seria',
      'seríamos',
      'seriam',
      'tenho',
      'tem',
      'temos',
      'tém',
      'tinha',
      'tínhamos',
      'tinham',
      'tive',
      'teve',
      'tivemos',
      'tiveram',
      'tivera',
      'tivéramos',
      'tenha',
      'tenhamos',
      'tenham',
      'tivesse',
      'tivéssemos',
      'tivessem',
      'tiver',
      'tivermos',
      'tiverem',
      'terei',
      'terá',
      'teremos',
      'terão',
      'teria',
      'teríamos',
      'teriam',
    ];

    let palavras = texto.split(/_+/);
    const stopWordsSemAcentos = stopWords.map(this.removeAccents);
    let palavrasFiltradas = palavras.filter(
      (palavra) => !stopWordsSemAcentos.includes(palavra.toLowerCase())
    );

    // Juntar as palavras filtradas em uma string
    return palavrasFiltradas.join('_');
  }

  removeAccents(strAccents: string): string {
    return strAccents.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
