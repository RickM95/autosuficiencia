const PATCH_MODES = {
  FULL_FILE_REPLACE: 'FULL_FILE_REPLACE',
  DIFF_PATCH: 'DIFF_PATCH',
  FUNCTION_REPLACE: 'FUNCTION_REPLACE',
}

export class PatchEngine {
  constructor() {
    this.appliedPatches = []
  }

  generatePatch(mode, params) {
    switch (mode) {
      case PATCH_MODES.FULL_FILE_REPLACE:
        return this._fullFileReplace(params)
      case PATCH_MODES.DIFF_PATCH:
        return this._diffPatch(params)
      case PATCH_MODES.FUNCTION_REPLACE:
        return this._functionReplace(params)
      default:
        return { valid: false, error: `Unknown patch mode: ${mode}` }
    }
  }

  _fullFileReplace(params) {
    if (!params.filePath || !params.content) {
      return { valid: false, error: 'filePath and content required for FULL_FILE_REPLACE' }
    }
    return {
      valid: true,
      mode: PATCH_MODES.FULL_FILE_REPLACE,
      filePath: params.filePath,
      content: params.content,
      description: params.description || `Replace ${params.filePath}`,
      size: params.content.split('\n').length,
      originalSize: params.originalSize || 0,
      diff: `[FULL REPLACE] ${params.filePath}`,
    }
  }

  _diffPatch(params) {
    if (!params.filePath || !params.oldString || !params.newString) {
      return { valid: false, error: 'filePath, oldString, and newString required for DIFF_PATCH' }
    }
    if (params.oldString === params.newString) {
      return { valid: false, error: 'oldString and newString are identical — no change needed' }
    }
    return {
      valid: true,
      mode: PATCH_MODES.DIFF_PATCH,
      filePath: params.filePath,
      oldString: params.oldString,
      newString: params.newString,
      description: params.description || `Patch ${params.filePath}`,
      context: params.context || 'hunk',
    }
  }

  _functionReplace(params) {
    if (!params.filePath || !params.functionName || !params.newBody) {
      return { valid: false, error: 'filePath, functionName, and newBody required for FUNCTION_REPLACE' }
    }
    return {
      valid: true,
      mode: PATCH_MODES.FUNCTION_REPLACE,
      filePath: params.filePath,
      functionName: params.functionName,
      newBody: params.newBody,
      description: `Replace function ${params.functionName} in ${params.filePath}`,
    }
  }

  recordPatch(patch) {
    this.appliedPatches.push({
      ...patch,
      appliedAt: Date.now(),
      id: `PATCH_${this.appliedPatches.length + 1}`,
    })
  }

  getPatchHistory() {
    return [...this.appliedPatches]
  }

  generatePatchSummary(lang = 'es') {
    if (this.appliedPatches.length === 0) {
      return lang === 'es'
        ? 'No hay parches registrados.'
        : 'No patches registered.'
    }

    const lines = [lang === 'es' ? '**Historial de parches:**' : '**Patch history:**']
    for (const p of this.appliedPatches) {
      lines.push(`  [${p.id}] ${p.description} (${p.mode})`)
    }
    return lines.join('\n')
  }

  static get Modes() { return PATCH_MODES }
}
