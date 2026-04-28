export const STAGES = [
  {
    id: 'SYSTEM_PRECHECK',
    order: 0,
    label_en: 'System Precheck',
    label_es: 'Verificación del sistema',
    critical: true,
    timeout: 5000,
    retryable: false,
    description_en: 'Checking browser compatibility and environment',
    description_es: 'Verificando compatibilidad del navegador y entorno',
  },
  {
    id: 'MODULE_REGISTRATION',
    order: 1,
    label_en: 'Module Registration',
    label_es: 'Registro de módulos',
    critical: true,
    timeout: 3000,
    retryable: false,
    description_en: 'Registering all system modules',
    description_es: 'Registrando todos los módulos del sistema',
  },
  {
    id: 'KB_LOAD',
    order: 2,
    label_en: 'Knowledge Base Load',
    label_es: 'Carga de base de conocimiento',
    critical: true,
    timeout: 5000,
    retryable: true,
    description_en: 'Loading Knowledge Base domain files',
    description_es: 'Cargando archivos de dominio de la base de conocimiento',
  },
  {
    id: 'KB_VALIDATION',
    order: 3,
    label_en: 'KB Validation',
    label_es: 'Validación de base de conocimiento',
    critical: true,
    timeout: 8000,
    retryable: false,
    description_en: 'Validating KB structure and integrity',
    description_es: 'Validando estructura e integridad de la base de conocimiento',
  },
  {
    id: 'INDEX_BUILD',
    order: 4,
    label_en: 'Index Building',
    label_es: 'Construcción de índices',
    critical: true,
    timeout: 5000,
    retryable: true,
    description_en: 'Building fast-lookup indexes',
    description_es: 'Construyendo índices de búsqueda rápida',
  },
  {
    id: 'STORAGE_SYNC',
    order: 5,
    label_en: 'Storage Sync',
    label_es: 'Sincronización de almacenamiento',
    critical: false,
    timeout: 8000,
    retryable: true,
    description_en: 'Syncing Knowledge Base to IndexedDB',
    description_es: 'Sincronizando base de conocimiento a IndexedDB',
  },
  {
    id: 'REASONING_ENGINE_INIT',
    order: 6,
    label_en: 'Reasoning Engine',
    label_es: 'Motor de razonamiento',
    critical: true,
    timeout: 10000,
    retryable: true,
    description_en: 'Initializing reasoning engine and state machine',
    description_es: 'Inicializando motor de razonamiento y máquina de estados',
  },
  {
    id: 'OPTIONAL_MODULES',
    order: 7,
    label_en: 'Optional Modules',
    label_es: 'Módulos opcionales',
    critical: false,
    timeout: 15000,
    retryable: false,
    description_en: 'Loading optional modules (Pyodide, PythonBridge)',
    description_es: 'Cargando módulos opcionales (Pyodide, PythonBridge)',
  },
  {
    id: 'FINAL_HEALTH_CHECK',
    order: 8,
    label_en: 'Health Check',
    label_es: 'Verificación de salud',
    critical: true,
    timeout: 3000,
    retryable: false,
    description_en: 'Running final system health check',
    description_es: 'Ejecutando verificación final de salud del sistema',
  },
  {
    id: 'SYSTEM_READY',
    order: 9,
    label_en: 'System Ready',
    label_es: 'Sistema listo',
    critical: true,
    timeout: 1000,
    retryable: false,
    description_en: 'System initialization complete',
    description_es: 'Inicialización del sistema completa',
  },
]

export function getStageById(id) {
  return STAGES.find(s => s.id === id) || null
}

export function getStageByOrder(order) {
  return STAGES.find(s => s.order === order) || null
}

export const CRITICAL_STAGES = STAGES.filter(s => s.critical).map(s => s.id)
export const TOTAL_STAGES = STAGES.length
export const TOTAL_CRITICAL = CRITICAL_STAGES.length
