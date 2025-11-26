import { FileData } from './types';

export const dataURItoBlob = (dataURI: string): Blob => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const processFile = async (file: File): Promise<FileData> => {
  const base64 = await readFileAsBase64(file);
  const previewUrl = URL.createObjectURL(file);
  
  return {
    file,
    previewUrl,
    base64,
    mimeType: file.type
  };
};

export const downloadImage = (dataUrl: string, filename: string) => {
  try {
    // Handle Data URLs by converting to Blob first (fixes issues with large base64 strings)
    if (dataUrl.startsWith('data:')) {
      const blob = dataURItoBlob(dataUrl);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Handle standard URLs
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (e) {
    console.error("Download failed", e);
    alert("Download failed. Please try right-clicking the image and selecting 'Save Image As'.");
  }
};

export const shareImage = async (dataUrl: string, title: string, text: string): Promise<boolean> => {
  try {
    if (navigator.share && dataUrl.startsWith('data:')) {
      const blob = dataURItoBlob(dataUrl);
      const file = new File([blob], 'my-style.png', { type: blob.type });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text,
          files: [file]
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Sharing failed:", error);
    // User cancelled or API failed
    return false;
  }
};
