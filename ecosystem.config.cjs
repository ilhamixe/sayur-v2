module.exports = {
  apps: [
    {
      name: "sayur-v2",
      script: "node_modules/.bin/next",
      args: "start -H 127.0.0.1 -p 3200",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      autorestart: true,
      watch: false,
      env: { NODE_ENV: "production" },
      time: true,
      kill_timeout: 10000,
    },
  ],
};
