const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure resolver to handle platform-specific modules
config.resolver.platforms = ['native', 'ios', 'android', 'web'];
config.resolver.mainFields = ['react-native', 'browser', 'main', 'module'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configure transformer to handle web platform properly
config.transformer = {
  ...config.transformer,
  getTransformOptions: async (entryPoints, options, getDependenciesOf) => {
    const opts = {
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    };
    
    // Disable Hermes for web platform
    if (options.platform === 'web') {
      opts.transform.hermesParser = false;
    }
    
    return opts;
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
