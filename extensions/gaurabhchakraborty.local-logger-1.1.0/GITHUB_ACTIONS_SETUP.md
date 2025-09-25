# 🚀 GitHub Actions Setup Guide

This guide explains how to configure GitHub Actions for automated deployment to the VS Code Marketplace.

## 🔧 Prerequisites

### 1. VS Code Marketplace Publisher Account

1. Visit [VS Code Marketplace Manage](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Create a publisher if you don't have one
4. Note your **Publisher ID**

### 2. Azure DevOps Personal Access Token

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Sign in with the same Microsoft account
3. Click on your profile → User Settings → Personal Access Tokens
4. Create a new token with:
   - **Name**: `VS Code Extension Publishing`
   - **Organization**: `All accessible organizations`
   - **Expiration**: Choose appropriate duration (90 days recommended)
   - **Scopes**: Select `Marketplace (Manage)`
5. **Copy the token** (you won't see it again!)

## 🔐 GitHub Repository Secrets

Add these secrets to your GitHub repository:

### Required Secrets

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following **Repository Secrets**:

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `VSCE_PAT` | VS Code Extension Publishing Token | The Personal Access Token from Azure DevOps |

### Setting up VSCE_PAT Secret

```bash
# Navigate to: Repository → Settings → Secrets and variables → Actions
# Click "New repository secret"
Name: VSCE_PAT
Secret: [paste your Azure DevOps Personal Access Token]
```

## 📝 Update Package.json

Ensure your `package.json` has the correct publisher:

```json
{
  "publisher": "YourPublisherName",
  "name": "ai-usage-tracker",
  "version": "1.0.0"
}
```

## 🚀 Workflow Triggers

### Automatic Deployment (Main Branch)

The deployment workflow triggers automatically when:

- Code is pushed to `main` or `master` branch
- All quality checks pass
- Version is automatically bumped based on commit messages

### Manual Deployment

You can also trigger deployment manually:

1. Go to Actions tab in your repository
2. Click "🚀 Deploy to VS Code Marketplace"
3. Click "Run workflow"
4. Choose version bump type:
   - **patch**: Bug fixes (1.0.0 → 1.0.1)
   - **minor**: New features (1.0.0 → 1.1.0)
   - **major**: Breaking changes (1.0.0 → 2.0.0)

### Version Bump Logic

The workflow automatically determines version bump type based on commit messages:

| Commit Message Pattern | Version Bump |
|------------------------|--------------|
| `feat:` or `feature:` | minor |
| `BREAKING CHANGE:` or `major:` | major |
| Everything else | patch |

## 📊 Workflow Overview

### Quality Checks Job
- ✅ Code linting
- ✅ Unit tests
- ✅ TypeScript compilation
- ✅ Extension packaging

### Documentation Checks Job
- ✅ Required files exist
- ✅ README.md completeness
- ✅ No placeholder content

### Security Checks Job
- ✅ Dependency audit
- ✅ Secrets detection
- ✅ Package validation

### Deploy Job
- 📈 Version bumping
- 📝 Changelog updates
- 🏗️ Extension building
- 📤 GitHub release creation
- 🚀 Marketplace publishing
- 💾 Commit version bump

## 🔄 Automated Features

### Dependency Updates
- **Schedule**: Weekly on Mondays at 9 AM UTC
- **Action**: Creates PR with dependency updates
- **Testing**: Automatically tests updates before PR creation

### Pull Request Validation
- **Trigger**: Every PR to main/master
- **Checks**: Lint, test, build, security audit
- **Feedback**: Automated PR comments with results

## 📋 First-Time Setup Checklist

### Repository Setup
- [ ] Fork/clone the repository
- [ ] Update `package.json` with your publisher ID
- [ ] Add `VSCE_PAT` secret to repository
- [ ] Test workflows locally first

### Marketplace Setup
- [ ] Create VS Code Marketplace publisher account
- [ ] Generate Azure DevOps PAT
- [ ] Verify marketplace access
- [ ] Test manual publishing once

### Testing
- [ ] Push a test commit to trigger workflow
- [ ] Check Actions tab for workflow results
- [ ] Verify version bump works correctly
- [ ] Confirm marketplace publication

## 🐛 Troubleshooting

### Common Issues

#### 1. VSCE_PAT Authentication Failed
```
Error: Failed to authenticate with VS Code Marketplace
```

**Solutions:**
- Check if PAT is correctly added to repository secrets
- Verify PAT has `Marketplace (Manage)` scope
- Ensure PAT hasn't expired
- Confirm publisher ID matches

#### 2. Package Validation Errors
```
Error: Package validation failed
```

**Solutions:**
- Check `package.json` required fields
- Verify icon file exists
- Ensure version format is correct
- Check for duplicate extensions in marketplace

#### 3. Version Bump Conflicts
```
Error: Git conflict during version bump
```

**Solutions:**
- Ensure main branch is up to date
- Check for conflicting version changes
- Manually resolve and re-run workflow

#### 4. Build Failures
```
Error: TypeScript compilation failed
```

**Solutions:**
- Run `npm run compile` locally
- Fix TypeScript errors
- Check dependencies are up to date
- Verify VS Code API compatibility

### Debug Commands

```bash
# Test locally before pushing
npm run compile
npm run lint
npm test
npm run package

# Check package contents
npx @vscode/vsce ls

# Dry run publishing
npx @vscode/vsce package --allow-star-activation

# Manual publish (for testing)
npx @vscode/vsce publish --pat [YOUR_PAT]
```

## 📈 Monitoring

### Successful Deployment Indicators
- ✅ All workflow jobs complete successfully
- ✅ New version tag created in repository
- ✅ GitHub release created with .vsix file
- ✅ Extension appears on VS Code Marketplace
- ✅ Version bump committed to main branch

### Marketplace Verification
1. Visit [VS Code Marketplace](https://marketplace.visualstudio.com/)
2. Search for your extension
3. Check version number matches
4. Verify description and images display correctly
5. Test installation from marketplace

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review dependency update PRs
- **Monthly**: Check marketplace analytics
- **Quarterly**: Update PAT expiration
- **As needed**: Update workflow configurations

### PAT Renewal
1. Generate new PAT before expiration
2. Update `VSCE_PAT` secret in repository
3. Test deployment to confirm it works

## 🎯 Next Steps

After setup is complete:

1. **Test the workflow** with a small change
2. **Monitor the first deployment** closely
3. **Share with your team** the new automated process
4. **Set up monitoring** for marketplace metrics
5. **Plan regular maintenance** schedule

---

## 🎉 You're Ready!

Your GitHub Actions are now configured for:
- ✅ Automated quality checks
- ✅ Automated version management
- ✅ Automated marketplace publishing
- ✅ Automated dependency updates
- ✅ Comprehensive PR validation

**Happy automated publishing!** 🚀
