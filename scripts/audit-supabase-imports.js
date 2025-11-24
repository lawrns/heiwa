/**
 * Audit script to find all direct Supabase imports
 * Identifies files that should use useSupabase() hook instead
 */

const fs = require('fs')
const path = require('path')

const projectRoot = process.cwd()
const results = {
  directImports: [],
  contextUsage: [],
  apiRoutes: [],
  serverComponents: [],
  issues: []
}

// Files/directories to exclude
const excludePatterns = [
  'node_modules',
  '.next',
  'coverage',
  'test-results',
  'scripts',
  '.git',
  'dist',
  'build'
]

// Patterns to match
const importPatterns = [
  /from ['"]@\/lib\/supabase['"]/,
  /from ['"]\.\.\/lib\/supabase['"]/,
  /from ['"]\.\/lib\/supabase['"]/,
  /import.*supabase.*from ['"]@\/lib\/supabase['"]/,
  /import.*supabaseAdmin.*from ['"]@\/lib\/supabase['"]/
]

const contextPattern = /useSupabase\(\)/

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => filePath.includes(pattern))
}

function scanFile(filePath) {
  if (shouldExclude(filePath)) return
  
  const content = fs.readFileSync(filePath, 'utf8')
  const relativePath = path.relative(projectRoot, filePath)
  
  // Check for direct imports
  const hasDirectImport = importPatterns.some(pattern => pattern.test(content))
  const hasContextUsage = contextPattern.test(content)
  const isApiRoute = filePath.includes('/api/')
  const isServerComponent = content.includes("'use server'") || (!content.includes("'use client'") && filePath.endsWith('.tsx'))
  
  if (hasDirectImport) {
    const issue = {
      file: relativePath,
      hasContextUsage,
      isApiRoute,
      isServerComponent,
      shouldFix: !isApiRoute && !isServerComponent && !hasContextUsage
    }
    
    if (isApiRoute) {
      results.apiRoutes.push(issue)
    } else if (isServerComponent) {
      results.serverComponents.push(issue)
    } else if (hasContextUsage) {
      results.contextUsage.push(issue)
    } else {
      results.directImports.push(issue)
      if (issue.shouldFix) {
        results.issues.push(issue)
      }
    }
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (shouldExclude(fullPath)) continue
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath)
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      scanFile(fullPath)
    }
  }
}

// Scan app and components directories
console.log('🔍 Scanning for Supabase imports...\n')

scanDirectory(path.join(projectRoot, 'app'))
scanDirectory(path.join(projectRoot, 'components'))

// Generate report
console.log('='.repeat(60))
console.log('📊 SUPABASE IMPORT AUDIT RESULTS')
console.log('='.repeat(60))

console.log(`\n✅ API Routes (OK - Server-side): ${results.apiRoutes.length}`)
if (results.apiRoutes.length > 0) {
  results.apiRoutes.slice(0, 5).forEach(item => {
    console.log(`   - ${item.file}`)
  })
  if (results.apiRoutes.length > 5) {
    console.log(`   ... and ${results.apiRoutes.length - 5} more`)
  }
}

console.log(`\n✅ Server Components (OK - Server-side): ${results.serverComponents.length}`)
if (results.serverComponents.length > 0) {
  results.serverComponents.slice(0, 5).forEach(item => {
    console.log(`   - ${item.file}`)
  })
  if (results.serverComponents.length > 5) {
    console.log(`   ... and ${results.serverComponents.length - 5} more`)
  }
}

console.log(`\n✅ Using Context (OK): ${results.contextUsage.length}`)
if (results.contextUsage.length > 0) {
  results.contextUsage.forEach(item => {
    console.log(`   - ${item.file}`)
  })
}

console.log(`\n⚠️  Direct Imports (Need Review): ${results.directImports.length}`)
if (results.directImports.length > 0) {
  results.directImports.forEach(item => {
    console.log(`   - ${item.file}`)
  })
}

console.log(`\n❌ Issues to Fix: ${results.issues.length}`)
if (results.issues.length > 0) {
  console.log('\nFiles that need to be updated to use useSupabase() hook:')
  results.issues.forEach(item => {
    console.log(`   - ${item.file}`)
  })
}

// Save results to file
const reportPath = path.join(projectRoot, 'supabase-import-audit.json')
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
console.log(`\n📄 Full report saved to: ${reportPath}`)

console.log('\n' + '='.repeat(60))
console.log('✅ Audit Complete')
console.log('='.repeat(60))

process.exit(results.issues.length > 0 ? 1 : 0)

