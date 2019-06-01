module.exports = {
  mozjpeg: { progressive: true, quality: 75 },
  pngquant: { quality: 75 },
  svgo: {
    plugins: [{ removeViewBox: false }, { cleanupIDs: true }]
  },
  webp: { quality: 75 }
};
