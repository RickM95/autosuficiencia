export class DependencyScanner {
  constructor() {
    this.scanCache = null
  }

  scan(registry, packageJson) {
    const allImports = new Set()
    const externalImports = new Set()

    if (registry) {
      for (const mod of Object.values(registry)) {
        if (mod.imports) {
          for (const imp of mod.imports) {
            allImports.add(imp)
            if (!imp.startsWith('.') && !imp.startsWith('/')) {
              const pkg = imp.split('/')[0]
              if (pkg.startsWith('@')) {
                externalImports.add(`${pkg.split('/')[0]}/${pkg.split('/')[1]}`)
              } else {
                externalImports.add(pkg)
              }
            }
          }
        }
      }
    }

    const installedDeps = new Set()
    if (packageJson) {
      if (packageJson.dependencies) {
        for (const d of Object.keys(packageJson.dependencies)) installedDeps.add(d)
      }
      if (packageJson.devDependencies) {
        for (const d of Object.keys(packageJson.devDependencies)) installedDeps.add(d)
      }
    }

    const missingDependencies = []
    const installedDependencies = []
    const recommendedInstalls = []

    for (const imp of externalImports) {
      if (installedDeps.has(imp)) {
        installedDependencies.push(imp)
      } else {
        missingDependencies.push(imp)
        if (!imp.startsWith('node:') && !imp.startsWith('npm:')) {
          recommendedInstalls.push(imp)
        }
      }
    }

    this.scanCache = {
      allImports: [...allImports],
      externalImports: [...externalImports],
      missingDependencies,
      installedDependencies,
      recommendedInstalls,
      totalModules: registry ? Object.keys(registry).length : 0,
      totalImports: allImports.size,
      scannedAt: Date.now(),
    }

    return this.scanCache
  }

  getLastScan() { return this.scanCache }
}
