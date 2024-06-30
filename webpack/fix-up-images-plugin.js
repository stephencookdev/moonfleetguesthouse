const { mkdirSync } = require("fs");
const path = require("path");
const glob = require("glob");
const sharp = require("sharp");
const rimraf = require("rimraf");

const ROOT = path.join(__dirname, "..");
const INPUT_DIR = "static_assets";
const ASSETS_DIR = "public/assets";
const THUMBNAIL_DIR = "public/assets-thumbnails";

const maxSizeJpeg = async (image, outputPath, { maxLength, quality }) => {
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

class FixUpImagesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise("FixUpImagesPlugin", async () => {
      // Assuming ASSETS_DIR and THUMBNAIL_DIR are defined earlier in the plugin
      const inputAssetsDir = path.join(ROOT, INPUT_DIR);
      const files = glob.sync(path.join(inputAssetsDir, "./**/*.+(jpg|jpeg)"));
      const start = Date.now();
      console.log(`CREATING THUMBNAILS for ${files.length} files`);

      rimraf.sync(ASSETS_DIR);
      rimraf.sync(THUMBNAIL_DIR);
      mkdirSync(ASSETS_DIR, { recursive: true });
      mkdirSync(THUMBNAIL_DIR, { recursive: true });

      const filePromises = files.flatMap((file) => {
        const relativePath = path.relative(inputAssetsDir, file);
        const outputPath = path.join(ROOT, ASSETS_DIR, relativePath);
        const thumbnailPath = path.join(ROOT, THUMBNAIL_DIR, relativePath);

        const image = sharp(file);

        return [
          maxSizeJpeg(image, outputPath, {
            maxLength: 1800,
            quality: 85,
          }),
          maxSizeJpeg(image, thumbnailPath, {
            maxLength: 600,
            quality: 70,
          }),
        ];
      });

      await Promise.all(filePromises);

      console.log(`Done CREATING THUMBNAILS in ${Date.now() - start}ms`);
    });
  }
}

module.exports = FixUpImagesPlugin;
