// from https://github.com/facebook/create-react-app/issues/5306#issuecomment-447948123

const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/build.js');
const config = defaults.__get__('config');

// Consolidate chunk files instead
config.optimization.splitChunks = {
  cacheGroups: {
    default: false
  }
};
// Move runtime into bundle instead of separate file
config.optimization.runtimeChunk = false;

// JS
config.output.filename = 'static/js/[name].js';
// CSS. "5" is MiniCssPlugin
config.plugins[5].options.filename = 'static/css/[name].css';
config.plugins[5].options.moduleFilename = () => 'static/css/[name].css';
