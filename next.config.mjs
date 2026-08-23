// next.config.mjs
const nextConfig = {
  // ✅ Ļoti svarīgi drošībai
  productionBrowserSourceMaps: false, // neļauj redzēt oriģinālo kodu DevTools

  // Disable Turbopack (use webpack instead)
  // Next.js 16 defaults to Turbopack, but we need webpack compatibility
  turbopack: {},
};

export default nextConfig;
