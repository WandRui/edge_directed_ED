(function(imageproc) {
    "use strict";

    /*
     * Apply sobel edge to the input data
     */
    imageproc.sobelEdge = function(inputData, outputData, threshold) {
        console.log("Applying Sobel edge detection...");

        /* Initialize the two edge kernel Gx and Gy */
        var Gx = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        var Gy = [
            [-1,-2,-1],
            [ 0, 0, 0],
            [ 1, 2, 1]
        ];

        /**
         * TODO: You need to write the code to apply
         * the two edge kernels appropriately
         */
        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var pixelX = 0;
                var pixelY = 0;

                // Apply the Gx and Gy kernels
                for (var j = -1; j <= 1; j++) {
                    for (var i = -1; i <= 1; i++) {
                        var pixel = imageproc.getPixel(inputData, x + i, y + j);
                        var value = (pixel.r + pixel.g + pixel.b) / 3;

                        pixelX += value * Gx[j + 1][i + 1];
                        pixelY += value * Gy[j + 1][i + 1];
                    }
                }
                // Calculate the gradient magnitude
                var magnitude = Math.hypot(pixelX, pixelY);
                // Apply the threshold
                var i = (x + y * outputData.width) * 4
                if (magnitude >= threshold) {
                    outputData.data[i]     = 255;
                    outputData.data[i + 1] = 255;
                    outputData.data[i + 2] = 255;
                } else {
                    outputData.data[i]     = 0;
                    outputData.data[i + 1] = 0;
                    outputData.data[i + 2] = 0;
                }

                // outputData.data[i]     = inputData.data[i];
                // outputData.data[i + 1] = inputData.data[i + 1];
                // outputData.data[i + 2] = inputData.data[i + 2];
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
