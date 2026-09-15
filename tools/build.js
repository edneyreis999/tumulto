import { cp, mkdir, rm, copyFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/tools', { recursive: true });
for (const dir of ['src', 'assets']) await cp(dir, `dist/${dir}`, { recursive: true });
for (const file of ['index.html', 'game-design.json', 'tools/game-design-schema.js']) await copyFile(file, `dist/${file}`);
console.log('Build estático criado em dist/.');
