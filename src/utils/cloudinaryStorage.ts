//* cloudinary storage utils

import cloudinary from '#config/cloudinary.config.js';
import { UploadApiResponse } from 'cloudinary';

export const upoadToCloudinary = async (
  fileBuffer: Buffer,
  folderName: string
): Promise<UploadApiResponse> => {
  // return promise
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      // resource
      {
        folder: folderName,
        resource_type: 'auto',
      },
      // after opeartion done ,  if failed or success what do
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          // for abnormal case where both failed
          reject(new Error('something went wrong in cloudianry upload'));
        }
      }
    );

    // pipe the bufffer
    // explanation
    /*
     The uploadStream created by cloudinary.uploader.uploadStream is a Writable Stream. 
     
     - Writes the final chunk of data
     -  Closes the pipe: It sends an "EOF" (End of File) signal to Cloudinary,

     Why don't we use .write()?
        Normally, if you were reading a massive 5GB file from a hard drive, 
        you would use .write() over and over again to send small chunks, 
        and then call .end() at the very end when the file is finished.

        But since you already have the entire file loaded into memory as one single Buffer (the fileBuffer), 
        you don't need to send it in pieces. You can just hand the entire buffer 
        to .end(fileBuffer) all at once.
      
      */

    uploadStream.end(fileBuffer);
  });
};

// delete cloudinary func
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> => {
  if (!publicId) {
    // eslint-disable-next-line no-console
    console.log('No public ID provided for deletion.');
    return;
  }

  try {
    // We must pass the resource_type! Defaults to 'image', but PDFs need 'raw'
    const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    // eslint-disable-next-line no-console
    console.log(`Cloudinary Delete Status for ${publicId}:`, response);
  } catch (error) {
    //* why not using global middleare
    // We log the error but don't throw it, so a failed cloud deletion
    // doesn't prevent the database record from being deleted.
    // eslint-disable-next-line no-console
    console.error(`Failed to delete from cloudinary: ${publicId}`, error);
  }
};
