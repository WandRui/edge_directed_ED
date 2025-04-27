(function(imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.blur = function(inputData, outputData, kernelSize) {
        console.log("Applying blur...");

        // You are given a 3x3 kernel but you need to create a proper kernel
        // using the given kernel size
        var kernel = Array.from({ length: kernelSize }, () => Array(kernelSize).fill(1));
        var adjust = Math.floor(kernelSize / 2);
        /**
         * TODO: You need to extend the blur effect to include different
         * kernel sizes and then apply the kernel to the entire image
         */

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                // Use imageproc.getPixel() to get the pixel values
                // over the kernel
                var values = [];
                for (var y_index = y-adjust; y_index <= y+adjust; y_index++) {
                    for (var x_index = x-adjust; x_index <= x+adjust; x_index++) {
                        var pixel = imageproc.getPixel(inputData, x_index, y_index);
                        values.push(pixel);
                    }
                }
                // Calculate the blur result
                // Multiply the pixel values with the kernel
                var blurredPixel = {r: 0, g: 0, b: 0};
                for (var i = 0; i < values.length; i++) {
                    blurredPixel.r += values[i].r * kernel[Math.floor(i/kernelSize)][i%kernelSize];
                    blurredPixel.g += values[i].g * kernel[Math.floor(i/kernelSize)][i%kernelSize];
                    blurredPixel.b += values[i].b * kernel[Math.floor(i/kernelSize)][i%kernelSize];
                }
                // Divide the result by the kernel size
                blurredPixel.r /= kernelSize * kernelSize;
                blurredPixel.g /= kernelSize * kernelSize;
                blurredPixel.b /= kernelSize * kernelSize;

                // Then set the blurred result to the output data
                
                var i = (x + y * outputData.width) * 4;
                outputData.data[i]     = blurredPixel.r;
                outputData.data[i + 1] = blurredPixel.g;
                outputData.data[i + 2] = blurredPixel.b;
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
