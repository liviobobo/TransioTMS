module.exports = {
  apps: [
    {
      // Backend API Server
      name: 'transio-backend',
      script: 'server/app.js',
      cwd: '/path/to/your/app',
      instances: 1,
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Performance & Memory
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=512',
      
      // Process Management
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      restart_delay: 1000,
      
      // Logging
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      pmx: true,
      monitoring: true,
      
      // Advanced Options
      kill_timeout: 1600,
      listen_timeout: 3000,
      wait_ready: true
    },
    
    {
      // Frontend Next.js Server - Standard Mode
      name: 'transio-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/your/app',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      
      // Performance & Memory
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Process Management
      min_uptime: '10s',
      max_restarts: 5,
      autorestart: true,
      restart_delay: 2000,
      
      // Logging
      log_file: './logs/pm2-frontend-combined.log',
      out_file: './logs/pm2-frontend-out.log',
      error_file: './logs/pm2-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      pmx: true,
      monitoring: true,
      
      // Advanced Options
      kill_timeout: 3000,
      listen_timeout: 5000,
      wait_ready: false
    }
  ],

  // Deployment Configuration (Optional - configure as needed)
  deploy: {
    production: {
      user: 'your-user',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/path/to/your/app',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'sudo mkdir -p /path/to/your/app/logs && sudo chown -R your-user:your-user /path/to/your/app',
      env: {
        NODE_ENV: 'production'
      }
    }
  },

  // Global PM2 Configuration
  pm2_serve: {
    path: '/path/to/your/app',
    port: 8080,
    spa: true
  },

  // Error handling
  error_handler: {
    enabled: true,
    max_size: '10M',
    rotate_interval: '0 0 * * *', // Daily rotation
    rotate_size: '10M'
  }
};