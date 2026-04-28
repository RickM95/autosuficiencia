export class DependencyAdvisor {
  analyze(scanResult) {
    if (!scanResult) return { recommendations: [], warnings: [], summary: '' }

    const recommendations = []
    const warnings = []

    for (const dep of (scanResult.recommendedInstalls || [])) {
      const isDev = this._isDevDependency(dep)
      const viteCompatible = this._isViteCompatible(dep)
      recommendations.push({
        package: dep,
        type: isDev ? 'devDependency' : 'dependency',
        installCmd: `npm install ${isDev ? '--save-dev ' : ''}${dep}`,
        viteCompatible,
        reason: isDev ? 'Build-time or development tool' : 'Runtime dependency detected in imports',
      })
      if (!viteCompatible) {
        warnings.push(`${dep}: May have Vite/ESM compatibility issues — verify before installing`)
      }
    }

    if (scanResult.missingDependencies && scanResult.missingDependencies.length > 0) {
      warnings.push(`${scanResult.missingDependencies.length} missing dependenc${scanResult.missingDependencies.length === 1 ? 'y' : 'ies'} detected`)
    }

    const summary = recommendations.length > 0
      ? `${recommendations.length} package(s) recommended for install (${warnings.length} warning${warnings.length === 1 ? '' : 's'})`
      : 'No missing dependencies detected'

    return { recommendations, warnings, summary }
  }

  generateInstallInstructions(recommendations, lang = 'es') {
    if (!recommendations || recommendations.length === 0) {
      return lang === 'es'
        ? 'No se requieren instalaciones.'
        : 'No installations required.'
    }

    const devDeps = recommendations.filter(r => r.type === 'devDependency')
    const runtimeDeps = recommendations.filter(r => r.type === 'dependency')

    const lines = []
    if (lang === 'es') {
      lines.push('**Instrucciones de instalación:**')
      lines.push('')
      if (runtimeDeps.length > 0) lines.push(`npm install ${runtimeDeps.map(r => r.package).join(' ')}`)
      if (devDeps.length > 0) lines.push(`npm install --save-dev ${devDeps.map(r => r.package).join(' ')}`)
      lines.push('')
      if (runtimeDeps.some(r => !r.viteCompatible) || devDeps.some(r => !r.viteCompatible)) {
        lines.push('⚠️ Algunos paquetes pueden tener problemas de compatibilidad con Vite.')
      }
    } else {
      lines.push('**Installation instructions:**')
      lines.push('')
      if (runtimeDeps.length > 0) lines.push(`npm install ${runtimeDeps.map(r => r.package).join(' ')}`)
      if (devDeps.length > 0) lines.push(`npm install --save-dev ${devDeps.map(r => r.package).join(' ')}`)
      lines.push('')
      if (runtimeDeps.some(r => !r.viteCompatible) || devDeps.some(r => !r.viteCompatible)) {
        lines.push('⚠️ Some packages may have Vite compatibility issues.')
      }
    }

    return lines.join('\n')
  }

  _isDevDependency(pkg) {
    const devPatterns = ['eslint', 'vite', 'webpack', 'babel', 'typescript', 'rollup', 'prettier', 'jest', 'mocha', 'cypress', 'tailwindcss', 'postcss', 'autoprefixer', 'sass', 'less', '@types/']
    return devPatterns.some(p => pkg.includes(p))
  }

  _isViteCompatible(pkg) {
    const incompatible = ['fs', 'path', 'os', 'crypto', 'child_process', 'net', 'tls', 'dgram', 'http2']
    return !incompatible.some(i => pkg === i || pkg === `node:${i}`)
  }
}
