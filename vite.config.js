import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project beneath the repository name; keep dev at /.
  base: command === 'build' ? '/Physics_Chemistry_7th/' : '/',
  server: { host: '0.0.0.0', allowedHosts: ['.e2b.app'] },
}));
