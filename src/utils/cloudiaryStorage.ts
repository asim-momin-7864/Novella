//* cloudinary storage utils

import { cloudinaryConfig } from '#config/cloudinary.config.js';
import { UploadApiResponse } from 'cloudinary';

export const upoadToCloudinary = async (
  fileBuffer: Buffer,
  folderName: string
): Promise<UploadApiResponse> => {
  // return promise
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryConfig.uploader.uploadStream(
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
