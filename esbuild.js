const esbuild = require('esbuild');

config = {
    entryPoints: ['src/frontend/main.ts', 'src/frontend/pages/adminPage.ts', 'src/frontend/pages/playPage.ts'],
    bundle: true,
    sourcemap: true,
    target: 'es2021',
    platform: 'browser',
    tsconfig: 'src/frontend/tsconfig.json',
    outdir: 'bin/frontend/',
};

esbuild.build(config).catch(() => process.exit(1));
