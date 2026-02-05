const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const defaultConfig = getDefaultConfig(__dirname);

// Azure SDK가 사용하는 Node.js 내장 모듈 → 폴리필 / 빈 모듈로 매핑
const nodePolyfills = {
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
  events: require.resolve('events'),
  path: require.resolve('path-browserify'),
  // React Native에서 사용 불가한 모듈은 빈 모듈로 대체
  os: require.resolve('empty-module'),
  fs: require.resolve('empty-module'),
  util: require.resolve('empty-module'),
  http: require.resolve('empty-module'),
  https: require.resolve('empty-module'),
  net: require.resolve('empty-module'),
  tls: require.resolve('empty-module'),
  zlib: require.resolve('empty-module'),
  assert: require.resolve('empty-module'),
};

// node: 프리픽스를 폴리필 패키지 이름으로 매핑 (Metro 정상 resolution 경유)
const nodeToPackage = {
  'node:crypto': 'crypto-browserify',
  'node:stream': 'readable-stream',
  'node:buffer': 'buffer',
  'node:process': 'process',
  'node:events': 'events',
  'node:path': 'path-browserify',
  'node:os': 'empty-module',
  'node:fs': 'empty-module',
  'node:util': 'empty-module',
  'node:http': 'empty-module',
  'node:https': 'empty-module',
  'node:net': 'empty-module',
  'node:tls': 'empty-module',
  'node:zlib': 'empty-module',
  'node:assert': 'empty-module',
};

const config = {
  resolver: {
    extraNodeModules: nodePolyfills,
    // node: 프리픽스 요청(node:crypto 등)을 폴리필 패키지 이름으로 변환
    resolveRequest: (context, moduleName, platform) => {
      if (nodeToPackage[moduleName]) {
        return context.resolveRequest(
          context,
          nodeToPackage[moduleName],
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
