define(
  'ephox.imagetools.api.ResultConversions',

  [
    'ephox.imagetools.util.ImageResult'
  ],

  function (ImageResult) {

    var blobToImageResult = function (blob) {
      return ImageResult.fromBlob(blob);
    };

    var fromBlobAndUrlSync = function (blob, uri) {
      // we have no reason to doubt the uri is valid
      return ImageResult.fromBlobAndUrlSync(blob, uri);
    };

    var imageToImageResult = function (image) {
      return ImageResult.fromImage(image);

    };

    var imageResultToBlob = function (ir, type, quality) {
      // Shortcut to not lose the blob filename when we aren't editing the image
      if (type === undefined && quality === undefined) {
        return imageResultToOriginalBlob(ir);
      } else {
        return ir.toAdjustedBlob(type, quality);
      }
    };

    var imageResultToOriginalBlob = function (ir) {
      return ir.toBlob();
    };

    var imageResultToDataURL = function (ir) {
      return ir.toDataURL();
    };

    return {
      // used outside
      blobToImageResult: blobToImageResult,
      fromBlobAndUrlSync: fromBlobAndUrlSync,
      imageToImageResult: imageToImageResult,
      imageResultToBlob: imageResultToBlob,
      imageResultToOriginalBlob: imageResultToOriginalBlob,
      imageResultToDataURL: imageResultToDataURL
    };
  }
);