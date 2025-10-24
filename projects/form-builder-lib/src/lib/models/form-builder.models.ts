export interface FormComponent {
  id: string;
  key: string; // Unique key for conditional logic
  type: ComponentType;
  label: string;
  placeholder?: string;
  required: boolean;
  value?: any;
  validation?: ValidationRule[];
  properties: ComponentProperties;
  children?: FormComponent[];
  parentId?: string;
  columnIndex?: number; // For components inside columns
  rows?: DataGridRow[]; // For DataGrid components
  valid?: boolean; // Universal validation status for all components
}

export interface ComponentProperties {
  classes?: string[];
  styles?: { [key: string]: string };
  attributes?: { [key: string]: any };
  options?: SelectOption[];
  rows?: number;
  cols?: number;
  multiple?: boolean;
  accept?: string;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  placeholder?: string;
  tooltip?: string;
  prefix?: string;
  mask?: string;
  layoutHorizontal?: boolean;
  conditional?: ConditionalLogic;
  collapsible?: boolean;
  initCollapsed?: boolean;
  columns?: ColumnDefinition[];
  clearOnHide?: boolean;
  hideLabel?: boolean;
  customClass?: string;
  allowsConfidentiality?: boolean;
  // DataGrid specific properties
  addAnother?: string;
  addAnotherPosition?: 'top' | 'bottom';
  disableAddingRemovingRows?: boolean;
  reorder?: boolean;
  defaultOpen?: boolean;
  tableView?: boolean;
  rowDrafts?: boolean;
  templates?: DataGridTemplates;
  // CKEditor specific properties
  ckEditorConfig?: {
    toolbar?: string[];
    height?: number;
    plugins?: string[];
    removePlugins?: string[];
    language?: string;
    fontFamily?: {
      options?: string[];
    };
    fontSize?: {
      options?: string[];
    };
    heading?: {
      options?: any[];
    };
    link?: {
      decorators?: any;
    };
    image?: {
      toolbar?: string[];
    };
    table?: {
      contentToolbar?: string[];
    };
  };
  // API Select specific properties
  apiConfig?: {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: { [key: string]: string };
    token?: string;
    labelField?: string;
    valueField?: string;
    requestBody?: any;
    cache?: boolean;
    cacheTimeout?: number; // in minutes
  };
  // Text Help specific properties
  help?: string; // HTML content for help text
  onlyInternal?: boolean; // Flag to determine styling
}

export interface ColumnDefinition {
  width: number;
  offset?: number;
  push?: number;
  pull?: number;
  size?: string;
  currentWidth?: number;
}

export interface DataGridTemplates {
  header?: string;
  row?: string;
}

export interface DataGridRow {
  id: string;
  data: { [key: string]: any };
  index: number;
}

export interface ConditionalLogic {
  show: string; // "true" or "false"
  when: string | string[]; // id(s) of the field(s) to watch
  eq: string;   // value to compare
}

export interface StepProperties {
  title?: string;
  disabled?: boolean;
  invisible?: boolean;
  conditional?: ConditionalLogic;
}

export interface SelectOption {
  value: any;
  label: string;
  selected?: boolean;
  originalData?: any; // For SELECT_API: stores the full object from API response
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  components: FormComponent[];
  order: number;
  properties?: StepProperties;
  valid?: boolean; // Propriedade para validação do step
}

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  steps: FormStep[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

export interface DragDropData {
  componentType?: ComponentType;
  component?: FormComponent;
  sourceIndex?: number;
  sourceParentId?: string;
}

export enum ComponentType {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  SELECT_BOX = 'selectbox',
  SELECT_API = 'selectapi',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  FILE = 'file',
  BUTTON = 'button',
  PANEL = 'panel',
  TABS = 'tabs',
  ACCORDION = 'accordion',
  GRID = 'grid',
  RICH_TEXT = 'richtext',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  URL = 'url',
  TEL = 'tel',
  COLUMNS = 'columns',
  DATAGRID = 'datagrid',
  TEXT_HELP = 'texthelp'
}

export enum ValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN = 'min',
  MAX = 'max',
  PATTERN = 'pattern',
  EMAIL = 'email',
  URL = 'url',
  CUSTOM = 'custom'
}

export interface ComponentTemplate {
  type: ComponentType;
  label: string;
  icon: string;
  category: ComponentCategory;
  description: string;
  defaultProperties: Partial<ComponentProperties>;
}

export enum ComponentCategory {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  LAYOUT = 'layout',
  DATA = 'data',
  CUSTOM = 'custom'
}

export interface TreeNode {
  id: string;
  label: string;
  type: ComponentType;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
  parentId?: string;
}

export interface AnnotationEntry {
  id: string;
  type: 'apontamento' | 'observacao';
  responseType?: string;
  content: string; // rich text HTML
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status?: 'normal' | 'pendente' | 'resolvido' | 'confirmado' | 'cancelado';
  internalNote?: boolean;
  parentId?: string;
}

export interface AnnotationsMap {
  [componentId: string]: AnnotationEntry[];
}

export interface FormBuilderState {
  currentStep: string;
  selectedComponent: FormComponent | null;
  selectedStep: FormStep | null;
  formSchema: FormSchema;
  previewMode: boolean;
  analysisMode?: boolean;
  dragInProgress: boolean;
  annotations?: AnnotationsMap;
}
