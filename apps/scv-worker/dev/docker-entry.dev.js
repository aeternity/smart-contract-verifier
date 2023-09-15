'use strict'
const { spawn } = require('child_process')

/*
 * Install dependencies every time package.json changes
 */
spawn('nodemon -w package.json --exec "npm install && npm run start:dev scv-worker"', {
  stdio: 'inherit',
  shell: true
})