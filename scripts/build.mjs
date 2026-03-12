import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const entries = [
  { entryPoints: ['src/frontend/homepage.js'], outfile: 'public/js/homepage.min.js' },
  { entryPoints: ['src/frontend/session-detail.js'], outfile: 'public/js/session-detail.min.js' },
  { entryPoints: ['src/frontend/time-analyze.js'], outfile: 'public/js/time-analyze.min.js' },
  { entryPoints: ['src/frontend/telemetry-browser.js'], outfile: 'public/js/telemetry-browser.min.js' },
];

const isProd = process.argv.includes('--prod');

const commonOptions = {
  bundle: true,
  minify: true,
  sourcemap: !isProd,
  target: ['es2020'],
  format: 'iife',
};

async function build() {
  for (const entry of entries) {
    if (isWatch) {
      const ctx = await esbuild.context({ ...commonOptions, ...entry });
      await ctx.watch();
      console.log(`👀 Watching ${entry.entryPoints[0]}...`);
    } else {
      await esbuild.build({ ...commonOptions, ...entry });
      console.log(`✅ Built ${entry.outfile}`);
    }
  }

  if (!isWatch) {
    console.log('\n📦 Build complete!');
  } else {
    console.log('\n👀 Watching for changes...');
  }
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
