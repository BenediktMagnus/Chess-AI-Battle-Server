const esbuild = require('esbuild');

config = {
    entryPoints: [
        'src/frontend/main.ts',
        'src/frontend/pages/playPage.ts'
    ],
    bundle: true,
    minify: true,
    target: 'es2021',
    platform: 'browser',
    tsconfig: 'src/frontend/tsconfig.release.json',
    outdir: 'bin/frontend/',
};

esbuild.build(config).catch(() => process.exit(1));
