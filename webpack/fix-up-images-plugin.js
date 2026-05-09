const {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} = require("fs");
const path = require("path");
const glob = require("glob");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const INPUT_DIR = "static_assets";
const ASSETS_DIR = "public/assets";
const THUMBNAIL_DIR = "public/assets-thumbnails";
const MANIFEST_FILE = ".cache/fix-up-images-manifest.json";
const OUTPUTS = [
  { directory: ASSETS_DIR, maxLength: 1800, quality: 85 },
  { directory: THUMBNAIL_DIR, maxLength: 600, quality: 70 },
];

const readManifest = () => {
  const manifestPath = path.join(ROOT, MANIFEST_FILE);

  if (!existsSync(manifestPath)) return {};

  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return {};
  }
};

const writeManifest = (manifest) => {
  const manifestPath = path.join(ROOT, MANIFEST_FILE);
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
};

const getSignature = (file, options) => {
  const stats = statSync(file);

  return [
    stats.size,
    stats.mtimeMs,
    options.maxLength,
    options.quality,
    1,
  ].join(":");
};

const maxSizeJpeg = async (inputPath, outputPath, { maxLength, quality }) => {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const longestLength = Math.max(metadata.width, metadata.height);
  const longestLengthKey =
    metadata.width > metadata.height ? "width" : "height";

  const needsResize = longestLength > maxLength;
  const resizedImage = needsResize
    ? image.resize({ [longestLengthKey]: maxLength })
    : image;

  return resizedImage
    .rotate() // turn EXIF rotation into a true rotation
    .jpeg({ quality: needsResize ? quality : 95, progressive: true })
    .toFile(outputPath);
};

const ensureCurrentOutput = async (file, outputPath, options, manifest) => {
  const signature = getSignature(file, options);

  if (manifest[outputPath] === signature && existsSync(outputPath)) {
    return false;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  await maxSizeJpeg(file, outputPath, options);
  manifest[outputPath] = signature;
  return true;
};

class FixUpImagesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise("FixUpImagesPlugin", async () => {
      const inputAssetsDir = path.join(ROOT, INPUT_DIR);
      const files = glob.sync(path.join(inputAssetsDir, "./**/*.+(jpg|jpeg)"));
      const start = Date.now();
      const manifest = readManifest();

      let processedCount = 0;
      const expectedOutputs = new Set();
      const filePromises = files.flatMap((file) =>
        OUTPUTS.map(async (options) => {
          const relativePath = path.relative(inputAssetsDir, file);
          const outputPath = path.join(ROOT, options.directory, relativePath);
          expectedOutputs.add(outputPath);

          const didProcess = await ensureCurrentOutput(
            file,
            outputPath,
            options,
            manifest
          );

          if (didProcess) processedCount += 1;
        })
      );

      await Promise.all(filePromises);

      Object.keys(manifest).forEach((outputPath) => {
        if (!expectedOutputs.has(outputPath)) {
          rmSync(outputPath, { force: true });
          delete manifest[outputPath];
        }
      });
      writeManifest(manifest);

      console.log(
        `Checked ${
          files.length
        } images, processed ${processedCount} outputs in ${
          Date.now() - start
        }ms`
      );
    });
  }
}

module.exports = FixUpImagesPlugin;
