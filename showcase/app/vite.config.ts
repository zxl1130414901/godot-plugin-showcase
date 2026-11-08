import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 构建目标是「单文件、可双击 file:// 打开」：
// - 关闭代码分割与 modulepreload，保证只有一个 JS 入口
// - 资源内联阈值拉高，避免产生额外的图片/字体请求
// - CSS 不拆分，构建后由 scripts/inline.mjs 把 CSS/JS 全部塞进 index.html
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 4_000_000,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
