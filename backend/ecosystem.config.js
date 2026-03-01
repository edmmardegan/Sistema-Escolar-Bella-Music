/* eslint-disable */
module.exports = {
  apps: [
    {
      name: 'api-escola', // Vamos manter um nome padrão único
      script: 'dist/main.js',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        DB_DATABASE: 'escolaron',
        DB_PASSWORD: '123456',
        DB_HOST: 'localhost',
        DB_USERNAME: 'evandro',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        DB_DATABASE: 'escolaron_dev', // O banco de teste
        DB_PASSWORD: '123456',
        DB_HOST: 'localhost',
        DB_USERNAME: 'evandro',
      },
    },
  ],
};
