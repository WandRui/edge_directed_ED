(function(imageproc) {
    "use strict";

    /*
     * Apply sobel edge to the input data
     */
    imageproc.sobelEdge = function(inputData, outputData, threshold, B_as_angle=false) {
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
                        // Use luminance grayscale
                        var value = 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;

                        pixelX += value * Gx[j + 1][i + 1];
                        pixelY += value * Gy[j + 1][i + 1];
                    }
                }
                // Calculate the gradient magnitude & angle
                var magnitude = Math.hypot(pixelX, pixelY);
                var angle = Math.atan2(pixelY, pixelX) * 180 / Math.PI;
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

                if (B_as_angle) {
                    // Use B value to store the angle
                    outputData.data[i + 2] = Math.round(angle);
                }
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
