/** High-confidence source secret scan. Values are never printed. */

const result = Bun.spawnSync([
  "rg",
  "--files",
  "--hidden",
  "-g", "*.{ts,tsx,js,jsx,json,toml,yaml,yml,md}",
  "-g", "!bun.lock",
  "-g", "!tests/artifacts/**",
  "-g", "!tests/e2e/.auth/**",
  "-g", "!.git/**",
]);

if (result.exitCode !== 0) {
  console.error("Unable to enumerate source files for the secret scan.");
  process.exit(1);
}

const patterns = [
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
];

const findings: string[] = [];
for (const path of result.stdout.toString().trim().split("\n").filter(Boolean)) {
  const source = await Bun.file(path).text();
  source.split("\n").forEach((line, index) => {
    if (patterns.some((pattern) => pattern.test(line))) findings.push(`${path}:${index + 1}`);
  });
}

if (findings.length > 0) {
  console.error(`Potential secrets found at ${findings.length} source location(s):`);
  for (const finding of findings) console.error(`  ${finding}`);
  process.exit(1);
}

console.log("No high-confidence secret patterns found in source files.");
