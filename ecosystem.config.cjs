const dotenv = require('dotenv');
const path = require('path');

// Carga variables desde .env en la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'columna-backend',
      script: './node_modules/.bin/nodemon',
      args: '--watch server.ts --exec tsx server.ts',
      cwd: __dirname,
      env: Object.assign({}, process.env, { NODE_ENV: 'production' }),
      env_development: Object.assign({}, process.env, { NODE_ENV: 'development' })
    }
  ]
};
