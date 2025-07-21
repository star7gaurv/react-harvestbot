const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve("process/browser.js"),
        buffer: require.resolve("buffer"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util"),
        crypto: require.resolve("crypto-browserify"),
        vm: false,
        fs: false,
        net: false,
        tls: false,
      };

      // Provide global polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        })
      );

      // Handle ESM resolution issues
      webpackConfig.resolve.extensionAlias = {
        ".js": [".js", ".ts", ".tsx"],
        ".mjs": [".mjs", ".js", ".ts", ".tsx"],
      };

      return webpackConfig;
    },
  },
  // TypeScript configuration
  typescript: {
    enableTypeChecking: true,
  },
};
