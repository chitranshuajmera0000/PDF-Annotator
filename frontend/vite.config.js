import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

copyFileSync(
  resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
  resolve(__dirname, 'public/pdf.worker.js')
);

export default defineConfig({
  plugins: [react()],
});