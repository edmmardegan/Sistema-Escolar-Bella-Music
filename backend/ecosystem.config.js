/* eslint-disable */
module.exports = {
  // ... resto do código
  apps: [
    {
      name: 'api-escola',
      script: 'dist/main.js', // ou o caminho do seu arquivo principal
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        DB_DATABASE: 'escolaron',
        DB_PASSWORD: '123456',
        DB_HOST: 'localhost', // ajuste se necessário
        DB_USERNAME: 'evandro',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        DB_DATABASE: 'escolaron_dev',
        DB_PASSWORD: '123456',
      },
    },
  ],
};
