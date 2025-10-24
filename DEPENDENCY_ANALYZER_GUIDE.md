# 📦 Dependency Analyzer Guide

## Overview
The Dependency Analyzer helps developers understand the health and security of a repository's dependencies. It analyzes package files, checks for outdated packages, identifies vulnerabilities, and provides a health score.

## Features

### ✨ Core Features
- **Multi-Language Support** - JavaScript/TypeScript (package.json), Python (requirements.txt), Go (go.mod)
- **Dependency List** - Shows all production and dev dependencies with versions
- **Outdated Detection** - Identifies packages that need updates
- **Vulnerability Warnings** - Highlights security issues (simulated)
- **Health Score** - Overall repository health rating (0-100)
- **Filter Options** - View all, outdated, or vulnerable dependencies
- **Package Info** - Display package.json metadata

### 🎯 User Benefits
- Know if a repo is well-maintained
- Identify security risks before using
- See which dependencies need updates
- Make informed decisions about repo quality
- Understand project dependencies at a glance

## How to Use

### Analyzing Dependencies

1. **Navigate to Repo Detail Page**
   - Go to any repository (e.g., `/repo/facebook/react`)
   - Scroll down to "Dependency Analysis" section

2. **Click "Analyze" Button**
   - System fetches dependency files from GitHub
   - Parses dependencies and versions
   - Checks for outdated packages
   - Simulates vulnerability scan

3. **View Results**
   - See summary cards with key metrics
   - Browse dependency list
   - Filter by status (all/outdated/vulnerable)
   - Check health score

### Understanding the Results

**Summary Cards:**
- **Total** - Number of dependencies + language
- **Outdated** - Packages that need updates
- **Vulnerabilities** - Security issues found
- **Health Score** - Overall quality rating (0-100)

**Health Score Calculation:**
- 100 = Perfect (no issues)
- 80-99 = Good (minor issues)
- 50-79 = Fair (some concerns)
- 0-49 = Poor (major issues)

**Dependency Status:**
- ✅ **Up to date** - Green badge, no action needed
- ⚠️ **Outdated** - Yellow badge, shows latest version
- 🚨 **Vulnerable** - Red/orange badge, shows severity level

**Vulnerability Levels:**
- 🔴 **Critical** - Immediate action required
- 🟠 **High** - Should fix soon
- 🟡 **Moderate** - Fix when possible
- 🔵 **Low** - Minor issue

### Filtering Dependencies

**All Tab:**
- Shows all production dependencies
- Default view

**Outdated Tab:**
- Shows only packages that need updates
- Displays latest available version

**Vulnerable Tab:**
- Shows only packages with security issues
- Displays vulnerability severity

### Dev Dependencies

- Click chevron to expand/collapse
- Shows development-only packages
- Separate from production dependencies

## Supported Languages

### JavaScript/TypeScript
**File:** `package.json`

**Features:**
- Production dependencies
- Dev dependencies
- Package metadata (name, version, description)
- Node engine requirements

**Example:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### Python
**File:** `requirements.txt`

**Features:**
- Package list with versions
- Supports various version specifiers (==, >=, ~=)

**Example:**
```
Django==4.2.0
requests>=2.28.0
pytest~=7.3.0
```

### Go
**File:** `go.mod`

**Features:**
- Module dependencies
- Version tracking

**Example:**
```go
module github.com/user/project

require (
    github.com/gin-gonic/gin v1.9.0
    github.com/lib/pq v1.10.9
)
```

## API Endpoint

### POST `/api/analyze-dependencies`

**Request:**
```json
{
  "owner": "facebook",
  "repo": "react"
}
```

**Response:**
```json
{
  "language": "JavaScript/TypeScript",
  "totalDependencies": 45,
  "dependencies": [
    {
      "name": "loose-envify",
      "version": "^1.1.0",
      "type": "dependency",
      "isOutdated": false,
      "hasVulnerability": false
    }
  ],
  "devDependencies": [...],
  "hasVulnerabilities": false,
  "outdatedCount": 3,
  "packageJson": {
    "name": "react",
    "version": "18.2.0",
    "description": "React is a JavaScript library..."
  }
}
```

**Error Response:**
```json
{
  "error": "No dependency file found (package.json, requirements.txt, or go.mod)"
}
```

## Component Props

### DependencyAnalyzer

```typescript
interface Props {
  owner: string;  // Repository owner
  repo: string;   // Repository name
}
```

**Usage:**
```tsx
<DependencyAnalyzer owner="facebook" repo="react" />
```

## Technical Implementation

### Dependency Detection

1. **Fetch File from GitHub**
   - Try package.json first
   - Fall back to requirements.txt
   - Fall back to go.mod
   - Return error if none found

2. **Parse Dependencies**
   - Extract package names and versions
   - Separate production vs dev dependencies
   - Clean version strings

3. **Analyze Status**
   - Check if version uses semver ranges (^, ~)
   - Simulate outdated check (in production, use npm registry API)
   - Simulate vulnerability check (in production, use npm audit or Snyk)

4. **Calculate Health Score**
   ```
   score = 100 - (outdatedPenalty + vulnerabilityPenalty)
   outdatedPenalty = (outdatedCount / totalCount) * 30
   vulnerabilityPenalty = hasVulnerabilities ? 40 : 0
   ```

### Future Enhancements

**Real Vulnerability Scanning:**
- Integrate with npm audit API
- Use Snyk API for comprehensive scanning
- Check CVE databases
- Real-time security alerts

**Real Outdated Detection:**
- Query npm registry for latest versions
- Compare semantic versions
- Show changelog links
- Suggest safe update paths

**Dependency Tree:**
- Visualize dependency relationships
- Show transitive dependencies
- Identify duplicate dependencies
- Detect circular dependencies

**License Checking:**
- Show license for each package
- Warn about incompatible licenses
- Generate license report

**Bundle Size Analysis:**
- Show package sizes
- Identify large dependencies
- Suggest lighter alternatives

**Update Automation:**
- Generate PR with updates
- Run tests before suggesting updates
- Batch compatible updates

## Best Practices

### For Users

1. **Check Before Using**
   - Always analyze dependencies before cloning
   - Look for high vulnerability counts
   - Check health score

2. **Understand Context**
   - Outdated doesn't always mean bad
   - Some projects intentionally use older versions
   - Check last commit date

3. **Security First**
   - Critical vulnerabilities = don't use
   - High vulnerabilities = investigate first
   - Low vulnerabilities = acceptable with caution

### For Developers

1. **Keep Dependencies Updated**
   - Regularly update packages
   - Use automated tools (Dependabot, Renovate)
   - Test after updates

2. **Minimize Dependencies**
   - Only add what you need
   - Consider bundle size
   - Evaluate alternatives

3. **Monitor Security**
   - Enable GitHub security alerts
   - Use npm audit regularly
   - Subscribe to security advisories

## Troubleshooting

### "No dependency file found"
**Issue:** Repository doesn't have package.json, requirements.txt, or go.mod

**Solutions:**
- Check if repo uses different language
- Verify file exists in root directory
- Some repos don't have dependencies

### "Failed to analyze dependencies"
**Issue:** API error or GitHub rate limit

**Solutions:**
- Wait a moment and try again
- Check GitHub token is configured
- Verify repository is public

### Inaccurate Results
**Issue:** Outdated or vulnerability data seems wrong

**Note:** Current implementation uses simulated data for demonstration. In production:
- Use real npm registry API
- Integrate actual vulnerability databases
- Implement proper version comparison

## Examples

### Healthy Repository
```
Total: 25 dependencies
Outdated: 2 (8%)
Vulnerabilities: 0
Health Score: 92/100
```
✅ Safe to use, well-maintained

### Moderate Issues
```
Total: 50 dependencies
Outdated: 15 (30%)
Vulnerabilities: 2 (Low)
Health Score: 58/100
```
⚠️ Usable but needs attention

### Poor Health
```
Total: 80 dependencies
Outdated: 40 (50%)
Vulnerabilities: 5 (2 Critical)
Health Score: 25/100
```
🚨 Avoid or fix issues first

## Summary

The Dependency Analyzer is a powerful tool that helps developers:
- ✅ Assess repository quality quickly
- ✅ Identify security risks
- ✅ Make informed decisions
- ✅ Understand maintenance status
- ✅ Save time on manual checks

It's an essential feature for any developer evaluating whether to use a repository in their project!
