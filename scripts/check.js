const { mkdirSync } = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const fix = process.argv.includes("--fix");

if (!process.versions.bun) {
  console.error("Run this with `bun check` or `bun check --fix`.");
  process.exit(1);
}

const prettierTargets = [
  "src/**/*.{js,jsx,json,md}",
  "scripts/**/*.js",
  "webpack/**/*.js",
  "gatsby-*.js",
  "gatsby-config.js",
  "gatsby-node.js",
  "package.json",
  "README.md",
];

const bin = (name) =>
  path.join(
    "node_modules",
    ".bin",
    process.platform === "win32" ? `${name}.cmd` : name
  );

const run = (label, command, args, options = {}) => {
  console.log(`\n> ${label}`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

mkdirSync(path.join(".cache", "xdg"), { recursive: true });

run("gatsby node runtime", "node", ["scripts/check-runtime.js"]);
run("prettier", "bun", [
  "--bun",
  bin("prettier"),
  fix ? "--write" : "--check",
  ...prettierTargets,
]);
run("gatsby build", "node", [bin("gatsby"), "build"], {
  env: {
    ...process.env,
    GATSBY_TELEMETRY_DISABLED: "1",
    XDG_CONFIG_HOME: ".cache/xdg",
  },
});
