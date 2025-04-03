// wwwroot/js/imageUtils.js

// Sharpen factors adjusted based on upscale factor
function getSharpenFactors(upscaleFactor) {
    // Base factors for 2x upscale
    const baseFactors = [
        0,     // Level 0
        0.2,   // Level 1
        0.4,   // Level 2
        0.7,   // Level 3
        1.0,   // Level 4
        1.4,   // Level 5
        1.68,  // Level 6 (+0.28 from L5)
        1.96,  // Level 7 (+0.28 from L6)
        2.24,  // Level 8 (+0.28 from L7)
        2.52,  // Level 9 (+0.28 from L8)
        2.8    // Level 10 (+0.28 from L9)
    ];

    // For 4x upscale, increase the sharpening effect
    if (upscaleFactor === 4) {
        return baseFactors.map(factor => factor * 2.5);
    }
    return baseFactors;
}

// Basic 3x3 sharpening convolution kernel using the factor 's'
// The center value increases the original pixel, neighbors subtract based on 's'
function getSharpenKernel(level, upscaleFactor) {
    // Clamp level to 0-10 (updated range)
    const clampedLevel = Math.max(0, Math.min(10, level));
    const factors = getSharpenFactors(upscaleFactor);
    const s = factors[clampedLevel];

    if (s === 0) return null; // No sharpening needed

    // Kernel remains the same structure but with adjusted intensity
    // [[ 0, -s,  0],
    //  [-s, 1+4s,-s],
    //  [ 0, -s,  0]]
    return [
        [0, -s, 0],
        [-s, 1 + 4 * s, -s],
        [0, -s, 0]
    ];
}

// Applies convolution filter (like sharpening) to canvas data
function applyConvolution(ctx, width, height, kernel) {
    if (!kernel) return; // No kernel, no operation

    const srcData = ctx.getImageData(0, 0, width, height);
    const dstData = new Uint8ClampedArray(srcData.data); // Create a copy to write to
    const srcPixels = srcData.data;
    const dstPixels = dstData;
    const kernelSize = kernel.length;
    const halfKernelSize = Math.floor(kernelSize / 2);

    // Calculate the effective 's' value from the kernel for logging
    const sValue = (kernel[1][1] - 1) / 4;
    console.log(`Applying sharpen kernel (level corresponds to factor s=${sValue.toFixed(2)})`);


    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;
            const dstIdx = (y * width + x) * 4;

            // Apply kernel
            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    const sampleY = Math.max(0, Math.min(height - 1, y + ky - halfKernelSize)); // Clamp coordinates
                    const sampleX = Math.max(0, Math.min(width - 1, x + kx - halfKernelSize));
                    const srcIdx = (sampleY * width + sampleX) * 4;
                    const weight = kernel[ky][kx];

                    r += srcPixels[srcIdx] * weight;
                    g += srcPixels[srcIdx + 1] * weight;
                    b += srcPixels[srcIdx + 2] * weight;
                    // Alpha (srcPixels[srcIdx + 3]) is not changed by sharpening
                }
            }

            dstPixels[dstIdx] = r; // Result is already clamped by Uint8ClampedArray
            dstPixels[dstIdx + 1] = g;
            dstPixels[dstIdx + 2] = b;
            dstPixels[dstIdx + 3] = srcPixels[dstIdx + 3]; // Preserve original alpha
        }
    }
    ctx.putImageData(new ImageData(dstData, width, height), 0, 0);
    console.log("Sharpening applied.");
}


window.imageProcessor = {
    getFileInfo: async function (file) {
        // Create a File object from the JS File instance
        return {
            name: file.name,
            size: file.size,
            type: file.type
        };
    },

    createStreamReference: async function (file) {
        // Create an array buffer from the file
        const arrayBuffer = await file.arrayBuffer();
        // Create a stream from the array buffer
        return new Uint8Array(arrayBuffer);
    },

    // Processes a single image: upscales and optionally sharpens
    processImage: function (imageDataUrl, upscaleFactor, sharpenLevel, outputMimeType) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;
                const newWidth = originalWidth * upscaleFactor;
                const newHeight = originalHeight * upscaleFactor;

                console.log(`Original: ${originalWidth}x${originalHeight}, Upscaling to: ${newWidth}x${newHeight}, Sharpen: ${sharpenLevel}`);

                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');

                // Set smoothing quality - 'high' is often default and good for upscaling
                ctx.imageSmoothingQuality = "high";
                ctx.imageSmoothingEnabled = true; // Enable browser interpolation

                // Draw the image scaled up
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                console.log("Image drawn scaled.");


                // Apply sharpening if needed
                if (sharpenLevel > 0) {
                    try {
                        // Get kernel based on sharpen level and upscale factor
                        const kernel = getSharpenKernel(sharpenLevel, upscaleFactor);
                        applyConvolution(ctx, newWidth, newHeight, kernel);
                        console.log(`Applied sharpening with level ${sharpenLevel} and upscale factor ${upscaleFactor}`);
                    } catch (e) {
                         console.error("Error during sharpening:", e);
                         console.warn("Continuing with unsharpened image after error.");
                    }
                } else {
                     console.log("Skipping sharpening (Level 0).");
                }


                // Export the canvas content
                try {
                    let quality = outputMimeType === 'image/jpeg' ? 0.95 : undefined;
                    const resultDataUrl = canvas.toDataURL(outputMimeType, quality);
                    console.log(`Exported as ${outputMimeType} ${quality ? ' (Q: '+quality+')': ''}. Length: ${resultDataUrl.length}`);

                     if (!resultDataUrl || resultDataUrl === "data:,") {
                         reject("Failed to generate data URL from canvas. Canvas might be tainted or too large.");
                         return;
                     }
                    resolve(resultDataUrl);
                } catch (e) {
                    console.error("Error converting canvas to data URL:", e);
                    reject(`Canvas export failed: ${e.message}. Image might be too large.`);
                }
            };
            img.onerror = (err) => {
                console.error("Error loading image into Image element:", err);
                reject('Failed to load image data.');
            };
            img.src = imageDataUrl;
        });
    },

    // Triggers a file download using an anchor tag
    downloadDataUrl: function (filename, dataUrl) {
        try {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link);
            console.log(`Download triggered for: ${filename}`);
            return true;
        } catch (e) {
             console.error(`Download failed for ${filename}:`, e);
             return false;
        }
    },

    // Download multiple files with proper handling
    downloadMultipleFiles: function (files) {
        return new Promise((resolve, reject) => {
            try {
                // Create a container div for downloads
                const container = document.createElement('div');
                container.style.display = 'none';
                document.body.appendChild(container);

                // Create all anchor elements first
                const links = files.map(file => {
                    const link = document.createElement('a');
                    link.href = file.dataUrl;
                    link.download = file.filename;
                    container.appendChild(link);
                    return link;
                });

                // Click links in sequence with proper delay
                let index = 0;
                const clickNext = () => {
                    if (index < links.length) {
                        links[index].click();
                        console.log(`Download triggered for: ${files[index].filename}`);
                        index++;
                        setTimeout(clickNext, 500); // 500ms delay between downloads
                    } else {
                        // Clean up when all downloads are triggered
                        document.body.removeChild(container);
                        resolve(true);
                    }
                };

                // Start the sequence
                clickNext();
            } catch (e) {
                console.error('Download multiple files failed:', e);
                reject(e);
            }
        });
    }
};