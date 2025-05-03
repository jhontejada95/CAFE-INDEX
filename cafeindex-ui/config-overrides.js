module.exports = function override(config, env) {
  // Add the necessary loader configurations
  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules\/@polkadot/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-syntax-numeric-separator']
      }
    }
  });
  
  return config;
}