import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repositoryRoot = join(__dirname, "..", "..");

function parseEnvContents(contents) {
  const result = {};
  const lineRegex = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(lineRegex);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2] ?? "";

    const isDoubleQuoted =
      value.length > 1 && value.startsWith('"') && value.endsWith('"');
    const isSingleQuoted =
      value.length > 1 && value.startsWith("'") && value.endsWith("'");

    if (isSingleQuoted || isDoubleQuoted) {
      value = value.slice(1, -1);
      if (isDoubleQuoted) {
        value = value.replace(/\\n/g, "\n");
      }
    } else {
      const commentIndex = value.indexOf(" #");
      value =
        commentIndex === -1 ? value.trim() : value.slice(0, commentIndex).trim();
    }

    result[key] = value;
  }

  return result;
}

function applyEnvFromFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const parsed = parseEnvContents(readFileSync(filePath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Ensure Next.js sees workspace-level env files when executed via pnpm filters.
const nodeEnv = process.env.NODE_ENV ?? "development";
const fallbackEnvFiles = [
  `.env.${nodeEnv}.local`,
  ".env.local",
  `.env.${nodeEnv}`,
  ".env"
];

for (const fileName of fallbackEnvFiles) {
  applyEnvFromFile(join(repositoryRoot, fileName));
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
