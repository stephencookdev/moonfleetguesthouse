const path = require("path");
const { existsSync, mkdirSync, renameSync } = require("fs");
const glob = require("glob");
const rimraf = require("rimraf");
const sharp = require("sharp");

const ASSETS_DIR = "assets";
const TMP_DIR = "assets-tmp";
const THUMBNAIL_DIR = "assets-thumbnails";

const maxSizeJpeg = (
  image,
  filePath,
  { maxLength, outputDir, quality, progressive }
) => {
  return image.metadata().then((metadata) => {
    const longestLength = Math.max(metadata.width, metadata.height);
    const longestLengthKey =
      metadata.width > metadata.height ? "width" : "height";
    const resizedImage =
      longestLength > maxLength
        ? image.resize({ [longestLengthKey]: maxLength })
        : image;

    return resizedImage
      .jpeg({ quality, progressive })
      .toFile(filePath.replace(`/${TMP_DIR}/`, `/${outputDir}/`));
  });
};

class FixUpImagesPlugin {
  apply(compiler) {
    compiler.hooks.done.tapPromise("FixUpImagesPlugin", async () => {
      const assetsDir = path.join(compiler.outputPath, ASSETS_DIR);
      const thumbnailDir = path.join(compiler.outputPath, THUMBNAIL_DIR);
      const tmpDir = path.join(compiler.outputPath, TMP_DIR);

      rimraf.sync(tmpDir);
      if (existsSync(assetsDir)) {
        renameSync(assetsDir, tmpDir);
        mkdirSync(assetsDir);
      }

      if (!existsSync(thumbnailDir)) {
        mkdirSync(thumbnailDir);
      }

      const files = glob.sync(path.join(tmpDir, "./**/*.+(jpg|jpeg)"));
      console.log(`CREATING THUMBNAILS for ${files.length} files`);

      const filePromises = files.map((file) => {
        const image = sharp(file);
        const thumbnailPromise = maxSizeJpeg(image, file, {
          maxLength: 400,
          outputDir: THUMBNAIL_DIR,
          quality: 70,
          progressive: true,
        });
        const mainPromise = maxSizeJpeg(image, file, {
          maxLength: 1800,
          outputDir: ASSETS_DIR,
          quality: 80,
          progressive: true,
        });

        return Promise.all([thumbnailPromise, mainPromise]);
      });

      await Promise.all(filePromises);

      rimraf.sync(tmpDir);
    });
  }
}

module.exports = FixUpImagesPlugin;
