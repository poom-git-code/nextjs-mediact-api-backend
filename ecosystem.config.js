module.exports = {
  apps: [{
    name: 'mediact-api',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    exec_mode: 'fork'
  }]
};