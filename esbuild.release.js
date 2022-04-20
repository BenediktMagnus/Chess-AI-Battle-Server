const esbuild = require('esbuild');

config = {
    entryPoints: ['src/frontend/main.ts'],
    bundle: true,
    minify: true,
    target: 'es2021',
    platform: 'browser',
    tsconfig: 'src/frontend/tsconfig.release.json',
    outfile: 'bin/frontend/main.js',
};

esbuild.build(config).catch(() => process.exit(1));
