const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// BR-OFFLINE: expo-sqlite web cần Metro phục vụ file .wasm (wa-sqlite)
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
