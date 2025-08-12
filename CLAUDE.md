# Claude Code Context & Troubleshooting Guide

This document contains important context, troubleshooting guides, and development notes for the Copango/Pagocon project to prevent recurring issues and speed up development.

## 🚨 Critical Issues & Solutions

### Expo Web Bundling: `import.meta` Error

**Problem:** When running `npx expo start --web`, you get the error:
```
Cannot use 'import.meta' outside a module
```

**Root Cause:** This happens because Metro is serving your bundle as a classic script instead of an ESM module. The `import.meta` syntax is an ESM feature that's not supported in Metro's web mode. Dependencies like `jiti`, `sucrase`, `acorn`, and others ship ESM builds that contain `import.meta` references.

**Immediate Workaround:**
```bash
# Option 1: Use Webpack for web bundling
EXPO_WEB_BUNDLER=webpack npx expo start --web --clear

# Option 2: Skip web and use device/simulator
npx expo start --android
npx expo start --ios
```

**Permanent Solution:**
The Metro config has been updated in `metro.config.js` to prefer CommonJS builds over ESM builds:

```js
config.resolver.mainFields = ['react-native', 'browser', 'main', 'module'];
```

This forces Metro to use CommonJS builds instead of ESM builds that contain problematic `import.meta` syntax.

**Files Modified:**
- `metro.config.js` - Added `mainFields` configuration

**Verification:**
Run `npx expo start --web --clear` - should bundle successfully without errors.

**Time Saved:** This issue can cost a full day of debugging. The solution is documented here for immediate reference.

---

## 📱 Project Overview

**App Name:** Copango (Healthcare Staff Portal)
**Description:** Communication and task management for healthcare teams
**Platforms:** iOS, Android, Web
**Bundle ID:** com.copango.app

## 🛠 Development Setup

### Prerequisites
- Node.js with npm
- Expo CLI: `npm install -g @expo/cli` or use `npx expo`
- Dependencies installed with: `npm install --legacy-peer-deps`

### Common Commands
```bash
# Start development
npx expo start

# Platform-specific
npx expo start --android
npx expo start --ios
npx expo start --web

# With cache clearing
npx expo start --clear

# Check project health
npx expo-doctor
```

### Dependencies Note
This project uses `--legacy-peer-deps` to resolve conflicts between:
- `@shopify/react-native-skia@2.0.0-next.4` (project dependency)
- `victory-native@41.18.0` requiring `@shopify/react-native-skia@>=1.2.3`

## 🔧 Configuration Files

### Metro Configuration (`metro.config.js`)
Key configurations:
- **Platform Support:** `['native', 'ios', 'android', 'web']`
- **Module Resolution:** Prefers CommonJS over ESM to avoid `import.meta` issues
- **NativeWind Integration:** CSS-in-JS styling
- **Hermes Disabled:** For web platform to prevent bundling issues

### App Configuration (`app.json`)
- **Scheme:** `copango://`
- **Platforms:** iOS, Android, Web
- **Bundler:** Metro for web
- **Engine:** Hermes for native platforms

## 🚀 Deployment Notes

### Environment Variables
The project uses Expo public environment variables:
- `EXPO_PUBLIC_VIBECODE_*` - Various API keys
- `EXPO_PUBLIC_SUPABASE_*` - Supabase configuration

### Build Commands
```bash
# Development build
npx expo run:ios
npx expo run:android

# Production build
npx expo build:web
```

## 📚 Architecture Notes

### Key Dependencies
- **React Native:** 0.79.5
- **Expo SDK:** 53.x
- **React:** 19.0.0
- **Supabase:** Backend services
- **NativeWind:** Tailwind CSS for React Native
- **React Navigation:** Navigation library
- **Anthropic SDK:** AI integration

### File Structure
```
src/
├── api/           # API clients (Anthropic, etc.)
├── components/    # Reusable UI components
├── lib/           # Utility libraries
├── navigation/    # Navigation configuration
├── screens/       # Screen components
├── services/      # Business logic services
└── utils/         # Helper utilities
```

## 🐛 Known Issues & Workarounds

### 1. Dependency Conflicts
**Issue:** `npm install` fails with ERESOLVE errors
**Solution:** Use `npm install --legacy-peer-deps`

### 2. Web Bundling Failures
**Issue:** `import.meta` errors in web builds
**Solution:** Metro config updated to prefer CommonJS builds (see Critical Issues section)

### 3. Port Conflicts
**Issue:** Port 8081 already in use
**Solution:** Use `--port` flag: `npx expo start --port 8082`

## 📝 Development Guidelines

1. **Always test web builds** after dependency changes
2. **Use `--legacy-peer-deps`** for npm install operations
3. **Clear cache** when experiencing bundling issues: `--clear` flag
4. **Check `npx expo-doctor`** for project health validation
5. **Document breaking changes** in this file

## 🔍 Debugging Tips

### Bundle Analysis
```bash
# Check for import.meta usage
grep -r "import\.meta" src/
find node_modules -name "*.js" -exec grep -l "import\.meta" {} \; | head -10
```

### Metro Debugging
```bash
# Clear Metro cache
npx expo start --clear

# Verbose Metro logging
DEBUG=Metro* npx expo start
```

### Web-Specific Issues
```bash
# Force Webpack bundler
EXPO_WEB_BUNDLER=webpack npx expo start --web

# Check browser console for detailed errors
```

---

**Last Updated:** 2025-08-12
**Updated By:** Claude Code Assistant
**Critical Issues Resolved:** 1 (import.meta bundling error)