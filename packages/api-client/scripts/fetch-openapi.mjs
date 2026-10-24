/* global console, fetch, process */
// Baixa o openapi.json anexado à release da versão fixada em backend-version.json.
// O repositório do backend é privado: exige BACKEND_TOKEN (acesso de leitura ao repositório).
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version, repo, asset } = JSON.parse(
  await readFile(join(root, 'backend-version.json'), 'utf8'),
);

const token = process.env.BACKEND_TOKEN;
if (!token) {
  console.error('Defina BACKEND_TOKEN (token com leitura no repositório do backend).');
  process.exit(1);
}

const api = `https://api.github.com/repos/${repo}`;
const baseHeaders = {
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
};

console.log(`Buscando a release ${version} de ${repo}`);
const releaseRes = await fetch(`${api}/releases/tags/${version}`, {
  headers: { ...baseHeaders, Accept: 'application/vnd.github+json' },
});
if (releaseRes.status === 404) {
  console.error(
    `Release ${version} não encontrada. Ela existe? O token tem acesso ao repositório?`,
  );
  process.exit(1);
}
if (!releaseRes.ok) {
  console.error(`Falha ao consultar a release: HTTP ${releaseRes.status}`);
  process.exit(1);
}

const release = await releaseRes.json();
const found = release.assets?.find((a) => a.name === asset);
if (!found) {
  console.error(`A release ${version} não tem o arquivo "${asset}" anexado.`);
  process.exit(1);
}

const fileRes = await fetch(`${api}/releases/assets/${found.id}`, {
  headers: { ...baseHeaders, Accept: 'application/octet-stream' },
});
if (!fileRes.ok) {
  console.error(`Falha ao baixar o arquivo: HTTP ${fileRes.status}`);
  process.exit(1);
}

let spec;
try {
  spec = JSON.parse(await fileRes.text());
} catch {
  console.error('O arquivo baixado não é um JSON válido.');
  process.exit(1);
}
if (!spec.openapi || !spec.paths) {
  console.error('O JSON baixado não parece uma especificação OpenAPI.');
  process.exit(1);
}

await writeFile(join(root, 'openapi.json'), `${JSON.stringify(spec, null, 2)}\n`);
console.log('openapi.json atualizado.');
