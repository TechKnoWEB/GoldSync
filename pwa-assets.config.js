import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimalPreset,
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#0c0b08', fit: 'contain' }
    },
    maskable: {
      sizes: [512],
      padding: 0.15,
      resizeOptions: { background: '#0c0b08', fit: 'contain' }
    },
    favicon: {
      sizes: [64],
      padding: 0.1
    },
    transparent: {
      sizes: [64, 192, 512],
      padding: 0,
      favicons: [[64, 'favicon.ico']]
    }
  },
  images: ['public/icon.svg']
});
