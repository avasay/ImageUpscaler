# Image Enhancer PWA

## Overview

Image Enhancer PWA is a Blazor WebAssembly Progressive Web App (PWA) that allows users to upscale and sharpen their images directly in the browser. It provides a simple and efficient way to enhance image quality without needing to install any desktop software.

## Features

- Supports JPG, PNG, and GIF image uploads.
- Upscaling options: 2x and 4x.
- Adjustable sharpening levels: 0 to 10.
- Processes images client-side using HTML5 Canvas and JavaScript.
- Shows previews of original and processed images.
- Allows downloading of individual processed images.
- Allows downloading all processed images as individual files.
- Responsive design for use on various devices.
- Progressive Web App (PWA) capabilities for offline use and installation.

## How to Use

1.  Click the 'Browse Files' button to select one or more images from your device.
2.  Select your desired upscale factor (2x or 4x) from the dropdown menu.
3.  Adjust the sharpen level using the slider (0 for no sharpening, 10 for maximum).
4.  Click the '🚀 Upscale & Enhance' button to process the images.
5.  View the previews of the original and processed images displayed side-by-side.
6.  Click the 'Download Processed Image' button next to any image to save it individually.
7.  Click the 'Download All Processed Images' button to save all enhanced images as individual files.

## Technical Stack

-   **Blazor WebAssembly:** For the core application framework and UI.
-   **C#:** For the application logic.
-   **HTML5 (Canvas API):** Used for client-side image manipulation.
-   **JavaScript:** Interops with Blazor for direct Canvas operations.
-   **Bootstrap:** For responsive styling and UI components.

## To Do / Future Enhancements (Optional)

-   Add support for more image formats (e.g., WebP, TIFF).
-   Implement batch renaming options for downloaded files.
-   Offer more advanced image editing tools (e.g., brightness adjustment, contrast control, color correction).
-   Improve error handling and provide more specific user feedback for edge cases (e.g., very large files, unsupported formats).
-   Add a 'Download All as ZIP' feature to package all processed images into a single downloadable archive.
-   Implement drag-and-drop file uploads for a more convenient user experience.
-   Explore Web Workers for background image processing to keep the UI responsive during intensive operations.
-   Add unit and integration tests.
