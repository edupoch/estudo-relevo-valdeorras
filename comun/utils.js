import * as GeoTIFF from "geotiff";

async function loadGeoTIFF(file) {
  // Read the GeoTIFF file
  const response = await fetch(file);
  const arrayBuffer = await response.arrayBuffer();
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  // Get raster data
  const rasters = await image.readRasters();
  const width = image.getWidth();
  const height = image.getHeight();

  // Assuming single band elevation data
  const elevationData = rasters[0];

  return {
    data: elevationData,
    width,
    height,
  };
}

export { loadGeoTIFF };
