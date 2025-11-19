import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyStatic() {
  const projectRoot = resolve(__dirname, '..');
  const source = resolve(projectRoot, 'public');
  const destination = resolve(projectRoot, 'dist');

  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });
}

copyStatic().catch((error) => {
  console.error('Erro ao copiar arquivos estáticos:', error);
  process.exitCode = 1;
});
