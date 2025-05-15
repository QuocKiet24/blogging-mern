import axios from "axios";

export const uploadImage = async (img) => {
  try {
    const {
      data: { uploadURL },
    } = await axios.get(
      `${import.meta.env.VITE_SERVER_DOMAIN}/aws/get-upload-url`
    );

    await axios.put(uploadURL, img, {
      headers: { "Content-Type": img.type },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percent}%`);
      },
    });

    return uploadURL.split("?")[0]; // Return clean S3 URL
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};
