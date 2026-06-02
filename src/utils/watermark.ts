import sharp from "sharp";
import fs from "fs";

export const addWatermark = async (
  inputPath: string,
  watermarkPath: string,
  outputPath: string
): Promise<void> => {
  const original = sharp(inputPath);
  const { width, height } = await original.metadata();

  if (!fs.existsSync(watermarkPath)) {
    throw new Error("Watermark file not found at: " + watermarkPath);
  }
  if (!width || !height) {
    throw new Error("Failed to get image dimensions.");
  }

  const watermarkTile = await sharp(watermarkPath)
    .ensureAlpha()
    .resize({ width: 100 }) // scale watermark
    .composite([
      {
        input: Buffer.from([0, 0, 0, 60]), // 20% opacity
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  // Create empty transparent canvas
  const overlay = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  // Generate tiled watermark positions
  const composites = [];
  const xStep = 200;
  const yStep = 200;
  for (let y = -100; y < height + 100; y += yStep) {
    for (let x = -100; x < width + 100; x += xStep) {
      composites.push({
        input: watermarkTile,
        top: y,
        left: x,
        blend: "over" as any, // leave as 'over'
      });
    }
  }

  // Draw tiled watermark layer
  const tiledOverlay = await overlay
    .composite(composites)
    .png()
    .toBuffer();

  // Composite watermark over original image
  await original
    .composite([
      {
        input: tiledOverlay,
        blend: "over", // use 'over', not 'overlay'
      },
    ])
    .toFile(outputPath);

  //console.log('✅ Watermark successfully added.');
};