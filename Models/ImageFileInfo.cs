// Models/ImageFileInfo.cs
namespace ImageEnhancerPwa.Client.Models
{
    public class ImageFileInfo
    {
        public string OriginalFileName { get; set; } = string.Empty;
        public string OriginalFileType { get; set; } = string.Empty; // e.g., "image/png"
        public string OriginalDataUrl { get; set; } = string.Empty;
        public string ProcessedFileName { get; set; } = string.Empty;
        public string ProcessedDataUrl { get; set; } = string.Empty;
        public bool IsProcessing { get; set; } = false;
        public string? ErrorMessage { get; set; } = null;
        public long OriginalFileSize { get; set; } // Size in bytes
        public long ProcessedFileSize { get; set; } // Size in bytes
    }
}