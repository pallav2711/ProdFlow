// =============================================================================
// PRODFLOW AI - PM2 ECOSYSTEM CONFIGURATION
// =============================================================================

module.exports = {
  apps: [
    {
      name: 'prodflow-backend',
      script: './backend/server.js',
      cwd: './backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_file: './logs/backend.log',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      node_args: '--max-old-space-size=1024',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'prodflow-ai-service',
      script: './ai-service/main.py',
      cwd: './ai-service',
      interpreter: './venv/bin/python',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ENVIRONMENT: 'production',
        PORT: 8000,
        HOST: '0.0.0.0'
      },
      log_file: './logs/ai-service.log',
      error_file: './logs/ai-service-error.log',
      out_file: './logs/ai-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      watch: false,
      max_restarts: 10,
      min_uptime: '30s'
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/prodflow-ai.git',
      path: '/var/www/prodflow-ai',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};