import { of, throwError } from 'rxjs';
import { FichaAnaliseComponent } from './ficha-analise.component';

// Mocks for injected services
class MockNgbModal {
  lastOptions: any;
  openCalls: any[] = [];
  open(content: any, options: any) {
    this.lastOptions = options;
    this.openCalls.push({ content, options });
    const modalRef = {
      close: jasmine.createSpy('close'),
      result: Promise.resolve(true),
    } as any;
    return modalRef;
  }
}

class MockFormBuilder {
  group(config: any) {
    // simple reactive-form-like mock with controls, valueChanges, setValue, get
    const controls: any = {};
    Object.keys(config).forEach((k) => {
      const cfg = config[k];
      const initial = Array.isArray(cfg) ? cfg[0] : cfg;
      const value = initial?.value !== undefined ? initial.value : initial;
      const disabled = initial?.disabled === true;
      const subs: ((val: any) => void)[] = [];
      const ctrl = {
        value,
        disabled,
        setValue: (v: any, opts?: any) => {
          ctrl.value = v;
          if (!opts || opts.emitEvent !== false) subs.forEach((fn) => fn(v));
        },
        valueChanges: { subscribe: (fn: any) => subs.push(fn) },
      };
      controls[k] = ctrl;
    });
    return {
      controls,
      get: (key: string) => ({
        ...controls[key],
        setValue: controls[key].setValue,
        valueChanges: controls[key].valueChanges,
      }),
    } as any;
  }
}

class MockAlertUtils {
  confirmations: string[] = [];
  warnings: string[] = [];
  errors: any[] = [];
  successes: string[] = [];
  confirmDialog(msg: string) {
    this.confirmations.push(msg);
    return Promise.resolve(true);
  }
  toastrWarningMsg(msg: string) {
    this.warnings.push(msg);
  }
  handleSucess(msg: string) {
    this.successes.push(msg);
  }
  toastrErrorMsg(e: any) {
    this.errors.push(e);
  }
}

class MockBibliotecaUtils {}

class MockSarhClientService {
  getServidoresPorMatricula(mats: string) {
    const list = mats.split(',').map((m) => ({
      codMatricula: Number(m),
      nomeNick: 'user' + m,
      nomeServidor: 'Servidor ' + m,
    }));
    return of(list);
  }
}

class MockEtpTipoPermissaoService {
  getEtpTipoPermissaoList() {
    return of([
      { chave: 'RESPONSAVEL', descricao: 'Responsável' },
      { chave: 'REVISOR', descricao: 'Revisor' },
      { chave: 'OUTRO', descricao: 'Outro' },
    ]);
  }
}

class MockFichaAnaliseAnalistasService {
  deleteFichaAnaliseAnalistas(arg: any) {
    return of({});
  }
}

class MockPrioridadeService {
  prioridades = [
    { id: 10, chave: 'ALTA', descricao: 'Alta', padrao: 1 },
    { id: 11, chave: 'MEDIA', descricao: 'Média', padrao: 0 },
  ];
  getPrioridadeFormulario() {
    return of(this.prioridades);
  }
}

class MockEtpPrazoService {
  prazos = [
    {
      idPrioridade: 10,
      idEtapa: 99,
      qtdDiasLimiteAnalista: 5,
      qtdDiasLimiteRevisor: 3,
    },
  ];
  getPrazoPorTipoContratacao(_: any) {
    return of(this.prazos);
  }
}

class MockEtpUnidadeAnaliseService {
  unidades = [{ sqIdUnidade: 2, padrao: 1 }];
  getUnidadeAnalisePorTipoContratacao(_: any) {
    return of(this.unidades);
  }
}

// Helper to build a component with mocks
function buildComponent(
  overrides: Partial<{
    prioridadeService: any;
    etpPrazoService: any;
    etpUnidadeAnaliseService: any;
    permissoesService: any;
    alertUtils: any;
    fichaAnaliseAnalistasService: any;
    sarhclientservice: any;
  }> = {}
) {
  const modal = new MockNgbModal();
  const fb = new MockFormBuilder() as any;
  const alert = overrides.alertUtils || new MockAlertUtils();
  const biblioteca = new MockBibliotecaUtils() as any;
  const sarh = overrides.sarhclientservice || new MockSarhClientService();
  const perm = overrides.permissoesService || new MockEtpTipoPermissaoService();
  const faas =
    overrides.fichaAnaliseAnalistasService ||
    new MockFichaAnaliseAnalistasService();
  const prio = overrides.prioridadeService || new MockPrioridadeService();
  const prazo = overrides.etpPrazoService || new MockEtpPrazoService();
  const unidadeAnalise =
    overrides.etpUnidadeAnaliseService || new MockEtpUnidadeAnaliseService();

  const comp = new FichaAnaliseComponent(
    modal as any,
    fb,
    alert as any,
    biblioteca as any,
    sarh as any,
    perm as any,
    faas as any,
    prio as any,
    prazo as any,
    unidadeAnalise as any
  );
  // attach child component mock
  (comp as any).SELECIONAR_ANALISTA = {
    open: jasmine.createSpy('open'),
  } as any;
  return {
    comp,
    modal,
    fb,
    alert,
    sarh,
    perm,
    faas,
    prio,
    prazo,
    unidadeAnalise,
  };
}

// Common data
function buildBaseData() {
  const etapaAnaliseList = [{ id: 1, nome: 'E1' }];
  const situacaoAnaliseList = [{ id: 2, nome: 'S1' }];
  const unidadeList = [
    { id: 1, sigla: 'U1', descricao: 'Unid 1' },
    { id: 2, sigla: 'U2', descricao: 'Unid 2' },
  ];
  const etp: any = {
    tipoContratacao: 'TC',
    descricao: 'Desc',
    numeroEtp: '123',
    unidadeId: 1,
    tipoContratacaoId: 9,
    etpEtapa: { id: 99 },
    etpFichaAnaliseAnalistas: [],
    id: 777,
  };
  return { etapaAnaliseList, situacaoAnaliseList, unidadeList, etp };
}

describe('FichaAnaliseComponent (unit)', () => {
  it('open() should warn when no unidades de análise or prazos', async () => {
    const unidadeAnaliseService = new MockEtpUnidadeAnaliseService();
    (unidadeAnaliseService as any).unidades = [];
    const prazoService = new MockEtpPrazoService();
    (prazoService as any).prazos = [];
    const { comp, alert } = buildComponent({
      etpUnidadeAnaliseService: unidadeAnaliseService,
      etpPrazoService: prazoService,
    });
    const { etapaAnaliseList, situacaoAnaliseList, unidadeList, etp } =
      buildBaseData();

    await comp.open(
      etapaAnaliseList,
      situacaoAnaliseList,
      unidadeList,
      etp,
      {},
      []
    );

    expect(alert.warnings).toContain(
      'Não há unidades de análises cadastradas para o tipo de contratação do ETP.'
    );
    expect(alert.warnings).toContain(
      'Não há prazos cadastradas para o tipo de contratação do ETP.'
    );
  });

  it('tableLazyLoading should set page.content when etp has analistas', () => {
    const { comp } = buildComponent();
    comp.etp = { etpFichaAnaliseAnalistas: [1] };
    comp.analistasList = [{ a: 1 }];
    comp.page = { content: [], totalElements: 0 } as any;
    comp.tableLazyLoading({});
    expect(comp.page.content).toEqual(comp.analistasList);
  });

  it('gravarFicha should validate unidade and analistas and emit after confirm', async () => {
    const { comp, alert } = buildComponent();
    const { etapaAnaliseList, situacaoAnaliseList, unidadeList, etp } =
      buildBaseData();
    await comp.open(
      etapaAnaliseList,
      situacaoAnaliseList,
      unidadeList,
      etp,
      {},
      []
    );

    // Missing unidadeAnalise triggers warn
    (comp as any).unidadeAnalise = null;
    comp.gravarFicha();
    expect(alert.warnings.pop()).toContain('Favor informar a unidade');

    // Set unidade and missing analistas triggers warn
    (comp as any).unidadeAnalise = { id: 2 };
    comp.analistasList = [];
    comp.gravarFicha();
    expect(alert.warnings.pop()).toContain('Favor informar os analistas');

    // Add analista and ensure emit happens
    comp.analistasList = [
      {
        idUnidade: 2,
        tipoPermissao: 'RESPONSAVEL',
        codMatricula: 123,
        nome: 'Servidor 123',
        login: 'user123',
        dataInicial: '2025-09-01',
        dataFinal: '2025-09-02',
      },
    ];

    let emitted: any;
    comp.gravarFichaAnalise.subscribe((v: any) => (emitted = v));
    await comp.gravarFicha();
    expect(emitted).toBeTruthy();
    expect(emitted.ficha.idEtp).toBe(etp.id);
    expect(emitted.analistas.length).toBe(1);
    expect(emitted.analistas[0].emailServidor).toBe('user123@stj.jus.br');
  });

  it('buscarUnidadesAnalise filters by descricaoSigla case-insensitive', () => {
    const { comp } = buildComponent();
    comp.unidadeAnaliseList = [
      { descricaoSigla: 'U1 - Unid 1' },
      { descricaoSigla: 'U2 - Outra' },
    ];
    comp.buscarUnidadesAnalise({ query: 'outra' });
    expect(comp.unidadeAnaliseListFilter.length).toBe(1);
    expect(comp.unidadeAnaliseListFilter[0].descricaoSigla).toContain('Outra');
  });

  it('onUnidadeAnaliseSelecionada should set selected and unidadeFichaAnalise', () => {
    const { comp } = buildComponent();
    const unidade = { value: { id: 5 } };
    comp.onUnidadeAnaliseSelecionada(unidade);
    expect(comp.unidadeAnaliseSelecionada).toEqual(unidade.value);
    expect(comp.unidadeFichaAnalise).toBe(5);
  });

  it('excluirAnalista should confirm and remove, update page, and call service', async () => {
    const { comp, faas } = buildComponent();
    spyOn(faas, 'deleteFichaAnaliseAnalistas').and.returnValue(of({}));
    comp.analistasList = [
      { idFichaAnalise: 1, tipoPermissao: 'RESPONSAVEL', codMatricula: 100 },
      { idFichaAnalise: 2, tipoPermissao: 'REVISOR', codMatricula: 200 },
    ];
    comp.page = { content: [], totalElements: 0 } as any;
    await (comp as any).excluirAnalista({
      idFichaAnalise: 1,
      tipoPermissao: 'RESPONSAVEL',
      codMatricula: 100,
    });
    expect(comp.page.content.length).toBe(1);
    expect(faas.deleteFichaAnaliseAnalistas).toHaveBeenCalled();
  });

  it('removerAnalistaFichaAnalise should handle success and error', () => {
    const alert = new MockAlertUtils();
    const svc = new MockFichaAnaliseAnalistasService();
    const { comp } = buildComponent({
      fichaAnaliseAnalistasService: svc,
      alertUtils: alert,
    });
    spyOn(svc, 'deleteFichaAnaliseAnalistas').and.returnValue(of({}));
    (comp as any).removerAnalistaFichaAnalise({ a: 1 });
    expect(alert.successes.length).toBe(1);

    (svc.deleteFichaAnaliseAnalistas as any).and.returnValue(
      throwError(() => 'e')
    );
    (comp as any).removerAnalistaFichaAnalise({ a: 1 });
    expect(alert.errors.length).toBe(1);
  });

  it('initPage should set default page object', () => {
    const { comp } = buildComponent();
    comp.initPage();
    expect(comp.page.size).toBe(5);
    expect(comp.page.totalElements).toBe(0);
  });

  it('adicionarAnalistas should call child open with correct args', () => {
    const { comp } = buildComponent();
    comp.unidadeFichaAnalise = 2;
    comp.permissaoList = [{}, {}] as any;
    comp.analistasList = [{}, {}] as any;
    const spy = (comp as any).SELECIONAR_ANALISTA.open as jasmine.Spy;
    comp.adicionarAnalistas();
    expect(spy).toHaveBeenCalledWith(2, comp.analistasList, comp.permissaoList);
  });

  it('incluirAnalista prevents duplicates and adds new with times', () => {
    const { comp, alert } = buildComponent();
    comp.idFichaAnalise = 9;
    comp.analistasList = [
      { tipoPermissao: 'RESPONSAVEL', codMatricula: 1 },
    ] as any;

    // duplicate
    comp.incluirAnalista({
      tipoPermissao: 'RESPONSAVEL',
      analista: { codMatriculaDelegado: 1 },
    });
    expect(alert.warnings.pop()).toContain('Analista já está inserido');

    // new
    comp.analistasList = [];
    comp.page = { content: [], totalElements: 0 } as any;
    comp.incluirAnalista({
      tipoPermissao: 'RESPONSAVEL',
      permissao: 'Responsável',
      dataInicial: '2025/09/01',
      dataFinal: '2025/09/10',
      analista: {
        codMatriculaDelegado: 55,
        idUnidadeDelegado: 7,
        nomeServidor: 'Nome',
        login: 'login',
      },
    });
    expect(comp.page.totalElements).toBe(1);
    expect(comp.analistasList[0].dataInicial.endsWith('T00:00:00')).toBeTrue();
    expect(comp.analistasList[0].dataFinal.endsWith('T23:59:59')).toBeTrue();
  });

  it('getTipoPermisaoService should filter only RESPONSAVEL and REVISOR', () => {
    const { comp } = buildComponent();
    comp.getTipoPermisaoService();
    expect(
      comp.permissaoList.every((p: any) =>
        ['RESPONSAVEL', 'REVISOR'].includes(p.chave)
      )
    ).toBeTrue();
  });

  it('calculaDiferencaDias returns correct day difference', () => {
    const { comp } = buildComponent();
    const d1 = '2025-01-01';
    const d2 = '2025-01-11';
    expect(comp.calculaDiferencaDias(d1, d2)).toBe(10);
  });

  it('setaTimeFichaDeAnalise converts date correctly', () => {
    const { comp } = buildComponent();
    const obj = { limiteRevisor: new Date('2025-02-03T00:00:00Z').toString() };
    comp.setaTimeFichaDeAnalise(obj);
    // result must be yyyy-mm-dd
    expect(obj.limiteRevisor).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('adicionarDias / converterData / adicionarTime', () => {
    const { comp } = buildComponent();
    const today = new Date(comp.adicionarDias(0));
    const tomorrow = new Date(comp.adicionarDias(1));
    expect(tomorrow.getTime() - today.getTime()).toBeGreaterThan(0);

    const d = comp.converterData(new Date('2025-12-05T12:00:00Z'));
    expect(d).toBe('2025-12-05');

    expect(comp.adicionarTime('', '00:00:00')).toBeNull();
    const dt = comp.adicionarTime('2025/09/01', '23:59:59');
    expect(dt).toBe('2025-09-01T23:59:59');
  });

  it('onPrioridadeChange should set qtdDias when prazo found and warn when not', async () => {
    const { comp, alert } = buildComponent();
    const { etapaAnaliseList, situacaoAnaliseList, unidadeList, etp } =
      buildBaseData();
    await comp.open(
      etapaAnaliseList,
      situacaoAnaliseList,
      unidadeList,
      etp,
      {},
      []
    );

    // Simulate selecting MEDIA via event.id not matching prazos
    await comp.onPrioridadeChange({ id: 11 });
    expect(alert.warnings.pop()).toContain('Não há prazos cadastrados');

    // Select ALTA again via form value path
    (comp as any).fichaAnaliseModalForm.get('prioridade').setValue('ALTA');
    await comp.onPrioridadeChange(null);
    expect(comp.qtdDiasLimiteAnalista).toBeGreaterThan(0);
  });
});
