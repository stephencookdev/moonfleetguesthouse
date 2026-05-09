const requiredNodeMajor = "22";
const nodeMajor = process.versions.node.split(".")[0];

if (nodeMajor !== requiredNodeMajor) {
  console.error(
    `Moonfleet expects Node ${requiredNodeMajor}.x. Current Node is ${process.version}.`
  );
  console.error(
    "Run `nvm use` from the repo root, then try again. Bun is the package manager, but Gatsby still runs on Node."
  );
  process.exit(1);
}
