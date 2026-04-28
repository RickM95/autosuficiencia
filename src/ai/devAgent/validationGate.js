export class ValidationGate {
  constructor() {
    this.validationLog = []
  }

  async validate(context) {
    const errors = []
    const warnings = []

    if (!context || typeof context !== 'object') {
      return { safe: false, errors: ['No validation context provided'], warnings: [] }
    }

    switch (context.type) {
      case 'patch':
        this._validatePatch(context, errors, warnings)
        break
      case 'dependency':
        this._validateDependency(context, errors, warnings)
        break
      case 'full':
        await this._validateFull(context, errors, warnings)
        break
      default:
        errors.push(`Unknown validation type: ${context.type}`)
    }

    const result = { safe: errors.length === 0, errors, warnings, validatedAt: Date.now() }
    this.validationLog.push(result)
    return result
  }

  _validatePatch(context, errors, warnings) {
    if (!context.target) {
      errors.push('PATCH_TARGET_MISSING: No target module specified for patch')
    }
    if (context.registry && context.target && !context.registry[context.target]) {
      errors.push(`PATCH_TARGET_NOT_FOUND: Module "${context.target}" does not exist in registry`)
    }
    if (context.patchMode && !['FULL_FILE_REPLACE', 'DIFF_PATCH', 'FUNCTION_REPLACE'].includes(context.patchMode)) {
      errors.push(`INVALID_PATCH_MODE: "${context.patchMode}" is not a supported patch mode`)
    }
    warnings.push('PATCH_REVIEW_REQUIRED: All patches should be reviewed before execution')
  }

  _validateDependency(context, errors, warnings) {
    if (context.install && !Array.isArray(context.install)) {
      errors.push('INVALID_INSTALL_FORMAT: install must be an array of package names')
    }
    if (context.install && context.install.length > 10) {
      warnings.push('BULK_INSTALL: Installing more than 10 packages at once is risky')
    }
  }

  async _validateFull(context, errors, warnings) {
    if (context.registry) {
      const keys = Object.keys(context.registry)
      if (keys.length === 0) {
        warnings.push('EMPTY_REGISTRY: No modules loaded in registry')
      }
      for (const [name, mod] of Object.entries(context.registry)) {
        if (mod.imports) {
          for (const imp of mod.imports) {
            if (imp.startsWith('.') && !imp.startsWith('..')) {
              const localTarget = imp.replace(/^\.\//, '')
              if (!keys.includes(localTarget) && !keys.some(k => k.endsWith('/' + localTarget) || k === localTarget.replace(/\.js$/, ''))) {
                const exists = keys.some(k => k.endsWith('/' + localTarget) || k === localTarget || k === localTarget.replace(/\.js$/, '') || k.endsWith(localTarget.replace(/\.js$/, '')))
                if (!exists) {
                  warnings.push(`BROKEN_IMPORT: "${name}" imports "${imp}" which may not resolve`)
                }
              }
            }
          }
        }
      }
    }

    if (context.packageJson) {
      if (!context.packageJson.dependencies && !context.packageJson.devDependencies) {
        warnings.push('NO_DEPENDENCIES: package.json has no dependencies section')
      }
    }
  }

  getLog() { return [...this.validationLog] }

  getLastResult() {
    return this.validationLog.length > 0 ? this.validationLog[this.validationLog.length - 1] : null
  }
}
