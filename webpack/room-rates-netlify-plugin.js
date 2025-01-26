const fs = require("fs").promises;
const path = require("path");
const rimraf = require("rimraf");
const yaml = require("js-yaml");
const { mkdirSync } = require("fs");

const ROOT = path.join(__dirname, "..");
const INPUT_DIR = "src/pages";
const INPUT_FILE = "room-rates.md";
const OUTPUT_DIR = "public/netlify";
const OUTPUT_FILE = "room-rates.json";

class RoomRatesNetlifyPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise("RoomRatesNetlifyPlugin", async () => {
      const start = Date.now();
      console.log(`CREATING NETLIFY ROOM RATES`);

      // Start from a clean slate
      const outputDir = path.join(ROOT, OUTPUT_DIR);
      rimraf.sync(outputDir);
      mkdirSync(outputDir, { recursive: true });

      const markdownContent = /\nrooms:\s*\n([\s]+.*\n)*/.exec(
        await fs.readFile(path.join(ROOT, INPUT_DIR, INPUT_FILE), "utf8")
      )[0];
      const roomsData = yaml.load(markdownContent);

      const jsonData = roomsData.rooms
        .map((room) => ({
          name: room.name,
          normalPrice: room.normalPrice,
          saturdayPrice: room.saturdayPrice,
        }))
        .reduce((acc, room) => {
          acc[
            room.name
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_]/g, "")
          ] = {
            standard: {
              amount: parseInt(room.normalPrice.replace("£", "")) * 100,
              currency: "GBP",
            },
            saturday: {
              amount: parseInt(room.saturdayPrice.replace("£", "")) * 100,
              currency: "GBP",
            },
          };
          return acc;
        }, {});

      // Write JSON to file
      const outputPath = path.join(outputDir, OUTPUT_FILE);
      await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), "utf8");

      console.log(
        `Done CREATING NETLIFY ROOM RATES in ${Date.now() - start}ms`
      );
    });
  }
}

module.exports = RoomRatesNetlifyPlugin;
