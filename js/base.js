(function(imageproc) {
    "use strict";

    /*
     * Apply negation to the input data
     */
    imageproc.negation = function(inputData, outputData) {
        console.log("Applying negation...");

        for (var i = 0; i < inputData.data.length; i += 4) {
            outputData.data[i]     = 255 - inputData.data[i];
            outputData.data[i + 1] = 255 - inputData.data[i + 1];
            outputData.data[i + 2] = 255 - inputData.data[i + 2];
        }
    }

    /*
     * Convert the input data to grayscale
     */
    imageproc.grayscale = function(inputData, outputData) {
        console.log("Applying grayscale...");

        /**
         * TODO: You need to create the grayscale operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            var gray = (inputData.data[i]     +
                        inputData.data[i + 1] +
                        inputData.data[i + 2]) / 3;
           
            // Change the RGB components to the resulting value
            // inputData.data[i]     = gray;
            // inputData.data[i + 1] = gray;
            // inputData.data[i + 2] = gray;

            outputData.data[i]     = 
            outputData.data[i + 1] = 
            outputData.data[i + 2] = gray;
        }
    }

    /*
     * Applying brightness to the input data
     */
    imageproc.brightness = function(inputData, outputData, offset) {
        console.log("Applying brightness...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by adding an offset
            for(var j = 0; j < 3; j++) {
                var value = inputData.data[i + j] + offset;
                // Handle clipping of the RGB components
                if (value < 0) {   
                    value = 0;
                } else if (value > 255) {
                    value = 255;
                }
                outputData.data[i + j] = value;
            }

            // outputData.data[i]     = inputData.data[i];
            // outputData.data[i + 1] = inputData.data[i + 1];
            // outputData.data[i + 2] = inputData.data[i + 2];

            // Handle clipping of the RGB components
        }
    }

    /*
     * Applying contrast to the input data
     */
    imageproc.contrast = function(inputData, outputData, factor) {
        console.log("Applying contrast...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by multiplying a factor
            for(var j = 0; j < 3; j++) {
                var value = inputData.data[i + j] * factor;
                // Handle clipping of the RGB components
                if (value < 0) {
                    value = 0;
                } else if (value > 255) {
                    value = 255;
                }
                outputData.data[i + j] = value;
            }

            // outputData.data[i]     = inputData.data[i];
            // outputData.data[i + 1] = inputData.data[i + 1];
            // outputData.data[i + 2] = inputData.data[i + 2];

            // Handle clipping of the RGB components
        }
    }

    /*
     * Make a bit mask based on the number of MSB required
     */
    function makeBitMask(bits) {
        var mask = 0;
        for (var i = 0; i < bits; i++) {
            mask >>= 1;
            mask |= 128;
        }
        return mask;
    }

    /*
     * Apply posterization to the input data
     */
    imageproc.posterization = function(inputData, outputData,
                                       redBits, greenBits, blueBits) {
        console.log("Applying posterization...");

        /**
         * TODO: You need to create the posterization operation here
         */
        
        // no-dither, floyd-steinberg, edge-directed
        var dither_method = $("#posterization-dither-method").val();
        var dither_threshold = $("#posterization-threshold-value").val();

        // Create the red, green and blue masks
        // A function makeBitMask() is already given
        var redMask   = makeBitMask(redBits);
        var greenMask = makeBitMask(greenBits);
        var blueMask  = makeBitMask(blueBits);
        
        if (dither_method == "no-dither") {
            for (var i = 0; i < inputData.data.length; i += 4){
                outputData.data[i] = inputData.data[i] & redMask;
                outputData.data[i + 1] = inputData.data[i + 1] & greenMask;
                outputData.data[i + 2] = inputData.data[i + 2] & blueMask;
            }
        }
        else{
            var R_error, G_error, B_error;
            var pixel_index, pixel_x, pixel_y;
            if (dither_method == "floyd-steinberg") {
                for (var i = 0; i < inputData.data.length; i += 4) {
                    outputData.data[i] = inputData.data[i] & redMask;
                    outputData.data[i + 1] = inputData.data[i + 1] & greenMask;
                    outputData.data[i + 2] = inputData.data[i + 2] & blueMask;
                    R_error = inputData.data[i] - outputData.data[i];
                    G_error = inputData.data[i + 1] - outputData.data[i + 1];
                    B_error = inputData.data[i + 2] - outputData.data[i + 2];
                     // Diffuse error with Floyd-Steinberg dithering
                    pixel_index = i / 4;
                    pixel_x = pixel_index % inputData.width;
                    pixel_y = Math.floor(pixel_index / inputData.width);
 
                     if (pixel_x < inputData.width - 1) {
                         // diffuse to the right pixel
                         inputData.data[i + 4]     += R_error * 7 / 16;
                         inputData.data[i + 5]     += G_error * 7 / 16;
                         inputData.data[i + 6]     += B_error * 7 / 16;
                     }
                     if (pixel_y < inputData.height - 1) {
                         // diffuse to the bottom pixel
                         inputData.data[i + inputData.width * 4]     += R_error * 5 / 16;
                         inputData.data[i + inputData.width * 4 + 1] += G_error * 5 / 16;
                         inputData.data[i + inputData.width * 4 + 2] += B_error * 5 / 16;
                     }
                     if (pixel_x > 0 && pixel_y < inputData.height - 1) {
                         // diffuse to the bottom-left pixel
                         inputData.data[i + inputData.width * 4 - 4]     += R_error * 3 / 16;
                         inputData.data[i + inputData.width * 4 - 3]     += G_error * 3 / 16;
                         inputData.data[i + inputData.width * 4 - 2]     += B_error * 3 / 16;
                     }
                     if (pixel_x < inputData.width - 1 && pixel_y < inputData.height - 1) {
                         // diffuse to the bottom-right pixel
                         inputData.data[i + inputData.width * 4 + 4]     += R_error * 1 / 16;
                         inputData.data[i + inputData.width * 4 + 5]     += G_error * 1 / 16;
                         inputData.data[i + inputData.width * 4 + 6]     += B_error * 1 / 16;
                     }
                }
            }
            else if (dither_method == "Atkinson") {
                for (var i = 0; i < inputData.data.length; i += 4) {
                    outputData.data[i] = inputData.data[i] & redMask;
                    outputData.data[i + 1] = inputData.data[i + 1] & greenMask;
                    outputData.data[i + 2] = inputData.data[i + 2] & blueMask;
                    R_error = inputData.data[i] - outputData.data[i];
                    G_error = inputData.data[i + 1] - outputData.data[i + 1];
                    B_error = inputData.data[i + 2] - outputData.data[i + 2];
                     // Diffuse error with Floyd-Steinberg dithering
                    pixel_index = i / 4;
                    pixel_x = pixel_index % inputData.width;
                    pixel_y = Math.floor(pixel_index / inputData.width);
 
                     if (pixel_x < inputData.width - 1) {
                         // diffuse to the right pixel
                         inputData.data[i + 4]     += R_error * 1 / 8;
                         inputData.data[i + 5]     += G_error * 1 / 8;
                         inputData.data[i + 6]     += B_error * 1 / 8;
                     }
                     if (pixel_x < inputData.width - 2) {
                        // diffuse to the right-right pixel
                        inputData.data[i + 8]     += R_error * 1 / 8;
                        inputData.data[i + 9]     += G_error * 1 / 8;
                        inputData.data[i + 10]     += B_error * 1 / 8;
                    }
                     if (pixel_y < inputData.height - 1) {
                         // diffuse to the bottom pixel
                         inputData.data[i + inputData.width * 4]     += R_error * 1 / 8;
                         inputData.data[i + inputData.width * 4 + 1] += G_error * 1 / 8;
                         inputData.data[i + inputData.width * 4 + 2] += B_error * 1 / 8;
                     }
                     if (pixel_x > 0 && pixel_y < inputData.height - 1) {
                         // diffuse to the bottom-left pixel
                         inputData.data[i + inputData.width * 4 - 4]     += R_error * 1 / 8;
                         inputData.data[i + inputData.width * 4 - 3]     += G_error * 1 / 8;
                         inputData.data[i + inputData.width * 4 - 2]     += B_error * 1 / 8;
                     }
                     if (pixel_y < inputData.height - 2) {
                         // diffuse to the bottom-bottom pixel
                         inputData.data[i + inputData.width * 4 + 4]     += R_error * 1 / 8;
                         inputData.data[i + inputData.width * 4 + 5]     += G_error * 1 / 8;
                         inputData.data[i + inputData.width * 4 + 6]     += B_error * 1 / 8;
                     }
                }
            }
            else if (dither_method == "edge-directed") {
                var sobel_edge = imageproc.createBuffer(inputData);
                imageproc.sobelEdge(inputData, sobel_edge, dither_threshold, true);
                for (var i = 0; i < inputData.data.length; i += 4) {
                    outputData.data[i] = inputData.data[i] & redMask;
                    outputData.data[i + 1] = inputData.data[i + 1] & greenMask;
                    outputData.data[i + 2] = inputData.data[i + 2] & blueMask;
                    R_error = inputData.data[i] - outputData.data[i];
                    G_error = inputData.data[i + 1] - outputData.data[i + 1];
                    B_error = inputData.data[i + 2] - outputData.data[i + 2];
                    // Diffuse error with edge_detected dithering
                    pixel_index = i / 4;
                    pixel_x = pixel_index % inputData.width;
                    pixel_y = Math.floor(pixel_index / inputData.width);
                    if (sobel_edge.data[i] == 255) {
                        // The pixel is an edge pixel
                        // Diffuse error with edge-directed dithering

                        // Get angle within range [-180, 180]
                        var angle = sobel_edge.data[i + 2];

                        var direction = "none";
                        if (angle >= -22.5 && angle < 22.5) {
                            direction = "right";
                        } else if (angle >= 22.5 && angle < 67.5) {
                            direction = "down-right";
                        } else if (angle >= 67.5 && angle < 112.5) {
                            direction = "down";
                        } else if (angle >= 112.5 && angle < 157.5) {
                            direction = "down-left";
                        }
                        
                        switch(direction) {
                            case "right":
                                if (pixel_x < inputData.width - 1) {
                                    // diffuse to the right pixel
                                    inputData.data[i + 4]     += R_error;
                                    inputData.data[i + 5]     += G_error;
                                    inputData.data[i + 6]     += B_error;
                                }
                                break;
                            case "down-right":
                                if (pixel_x < inputData.width - 1 && pixel_y < inputData.height - 1) {
                                    // diffuse to the bottom-right pixel
                                    inputData.data[i + inputData.width * 4 + 4]     += R_error;
                                    inputData.data[i + inputData.width * 4 + 5]     += G_error;
                                    inputData.data[i + inputData.width * 4 + 6]     += B_error;
                                }
                                break;
                            case "down":
                                if (pixel_y < inputData.height - 1) {
                                    // diffuse to the bottom pixel
                                    inputData.data[i + inputData.width * 4]     += R_error;
                                    inputData.data[i + inputData.width * 4 + 1] += G_error;
                                    inputData.data[i + inputData.width * 4 + 2] += B_error;
                                }
                                break;
                            case "down-left":
                                if (pixel_x > 0 && pixel_y < inputData.height - 1) {
                                    // diffuse to the bottom-left pixel
                                    inputData.data[i + inputData.width * 4 - 4]     += R_error;
                                    inputData.data[i + inputData.width * 4 - 3]     += G_error;
                                    inputData.data[i + inputData.width * 4 - 2]     += B_error;
                                }
                                break;
                            default:
                                break;
                        }
                        // outputData.data[i]     = inputData.data[i] & redMask;
                        // outputData.data[i + 1] = inputData.data[i + 1] & greenMask;
                        // outputData.data[i + 2] = inputData.data[i + 2] & blueMask;
                    }
                    else{
                        // non-edge pixel
                        // Diffuse error with Floyd-Steinberg dithering
                        if (pixel_x < inputData.width - 1) {
                            // diffuse to the right pixel
                            inputData.data[i + 4]     += R_error * 7 / 16;
                            inputData.data[i + 5]     += G_error * 7 / 16;
                            inputData.data[i + 6]     += B_error * 7 / 16;
                        }
                        if (pixel_y < inputData.height - 1) {
                            // diffuse to the bottom pixel
                            inputData.data[i + inputData.width * 4]     += R_error * 5 / 16;
                            inputData.data[i + inputData.width * 4 + 1] += G_error * 5 / 16;
                            inputData.data[i + inputData.width * 4 + 2] += B_error * 5 / 16;
                        }
                        if (pixel_x > 0 && pixel_y < inputData.height - 1) {
                            // diffuse to the bottom-left pixel
                            inputData.data[i + inputData.width * 4 - 4]     += R_error * 3 / 16;
                            inputData.data[i + inputData.width * 4 - 3]     += G_error * 3 / 16;
                            inputData.data[i + inputData.width * 4 - 2]     += B_error * 3 / 16;
                        }
                        if (pixel_x < inputData.width - 1 && pixel_y < inputData.height - 1) {
                            // diffuse to the bottom-right pixel
                            inputData.data[i + inputData.width * 4 + 4]     += R_error * 1 / 16;
                            inputData.data[i + inputData.width * 4 + 5]     += G_error * 1 / 16;
                            inputData.data[i + inputData.width * 4 + 6]     += B_error * 1 / 16;
                        }
                    }
                }
            }
        }
    }

    /*
     * Apply threshold to the input data
     */
    imageproc.threshold = function(inputData, outputData, thresholdValue) {
        console.log("Applying thresholding...");

        /**
         * TODO: You need to create the thresholding operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            // You will apply thresholding on the grayscale value
            var gray = (inputData.data[i]     +
                        inputData.data[i + 1] +
                        inputData.data[i + 2]) / 3;
            
            if(gray < thresholdValue) {
                outputData.data[i]     = 0;
                outputData.data[i + 1] = 0;
                outputData.data[i + 2] = 0;
            } else {
                outputData.data[i]     = 255;
                outputData.data[i + 1] = 255;
                outputData.data[i + 2] = 255;
            }
            // Change the colour to black or white based on the given threshold

            // outputData.data[i]     = inputData.data[i];
            // outputData.data[i + 1] = inputData.data[i + 1];
            // outputData.data[i + 2] = inputData.data[i + 2];
        }
    }

    /*
     * Build the histogram of the image for a channel
     */
    function buildHistogram(inputData, channel) {
        var histogram = [];
        for (var i = 0; i < 256; i++)
            histogram[i] = 0;

        /**
         * TODO: You need to build the histogram here
         */

        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        for(var i=0; i < inputData.data.length; i += 4) {
            switch(channel) {
                case "gray":
                    // Find the grayscale value using simple averaging
                    var gray = parseInt((inputData.data[i]     +
                                inputData.data[i + 1] +
                                inputData.data[i + 2]) / 3);
                    histogram[gray]++;
                    break;
                case "red":
                    histogram[inputData.data[i]]++;
                    break;
                case "green":
                    histogram[inputData.data[i + 1]]++;
                    break;
                case "blue":
                    histogram[inputData.data[i + 2]]++;
                    break;
                default:
                    console.error("Invalid channel: " + channel);
                    break;
            } 

        }
        return histogram;
    }

    /*
     * Find the min and max of the histogram
     */
    function findMinMax(histogram, pixelsToIgnore) {
        var min = 0, max = 255;

        /**
         * TODO: You need to build the histogram here
         */
        var left_pixels_ignore = pixelsToIgnore;
        var right_pixels_ignore = pixelsToIgnore;
        for(; min < 255; min++) {
            if(histogram[min] > 0) {
                // Ignore the number of pixels given by pixelsToIgnore
                if(left_pixels_ignore >= histogram[min]) {
                    left_pixels_ignore -= histogram[min];
                } else {
                    break;
                }
            }
        }

        for(; max > 0; max--) {
            if(histogram[max] > 0) {
                // Ignore the number of pixels given by pixelsToIgnore
                if(right_pixels_ignore > histogram[max]) {
                    right_pixels_ignore -= histogram[max];
                } else {
                    break;
                }
            }
        }

        // console.log("min: " + min);
        // console.log("max: " + max);

        // Find the minimum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
       
        // Find the maximum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        
        return {"min": min, "max": max};
    }

    /*
     * Apply automatic contrast to the input data
     */
    imageproc.autoContrast = function(inputData, outputData, type, percentage) {
        console.log("Applying automatic contrast...");

        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;

        var histogram, minMax;
        if (type == "gray") {
            // Build the grayscale histogram
            histogram = buildHistogram(inputData, "gray");

            // Print the histogram for debugging
            // console.log(histogram.slice(0, 10).join(", "));

            // Find the minimum and maximum grayscale values with non-zero pixels
            minMax = findMinMax(histogram, pixelsToIgnore);

            var min = minMax.min, max = minMax.max, range = max - min;

            /**
             * TODO: You need to apply the correct adjustment to each pixel
             */

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each pixel based on the minimum and maximum values
                for(var j=0; j < 3; j++) {
                    var value = inputData.data[i + j];
                    value = (value - min) / range * 255;
                    // Handle clipping
                    if (value < 0) {
                        value = 0;
                    } else if (value > 255) {
                        value = 255;
                    }
                    outputData.data[i + j] = value;
                }

                // outputData.data[i]     = inputData.data[i];
                // outputData.data[i + 1] = inputData.data[i + 1];
                // outputData.data[i + 2] = inputData.data[i + 2];
            }
        }
        else {

            /**
             * TODO: You need to apply the same procedure for each RGB channel
             *       based on what you have done for the grayscale version
             */

            // Adjust each channel based on the histogram of each one
            // Build the histogram for each channel
            for (var channel of ["red", "green", "blue"]) {
                var channel_index = 0;
                if (channel == "red") {
                    channel_index = 0;
                } else if (channel == "green") {
                    channel_index = 1;
                } else if (channel == "blue") {
                    channel_index = 2;
                }

                histogram = buildHistogram(inputData, channel);

                // Print the histogram for debugging
                // console.log(histogram.slice(0, 10).join(", "));

                // Find the minimum and maximum grayscale values with non-zero pixels
                minMax = findMinMax(histogram, pixelsToIgnore);

                var min = minMax.min, max = minMax.max, range = max - min;

                for (var i = 0; i < inputData.data.length; i += 4) {
                    // Adjust each pixel based on the minimum and maximum values
                    var value = inputData.data[i+channel_index];
                    value = (value - min) / range * 255;
                    // Handle clipping
                    if (value < 0) {
                        value = 0;
                    } else if (value > 255) {
                        value = 255;
                    }
                    outputData.data[i+channel_index] = value;
                }
            }
        }
    }
}(window.imageproc = window.imageproc || {}));
