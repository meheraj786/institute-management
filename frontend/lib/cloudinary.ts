const maxImageSize = 5 * 1024 * 1024;

export async function uploadCloudinaryImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file");
  }
  if (file.size > maxImageSize) {
    throw new Error("Image must be 5 MB or smaller");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary upload is not configured");
  }

  const body = new FormData();
  body.set("file", file);
  body.set("upload_preset", uploadPreset);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );
  const result = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? "Image upload failed");
  }
  return result.secure_url;
}
