import CryptoJS from "crypto-js";

// Retrieve the encryption key from environment variables
const saltKey = import.meta.env.VITE_SALT_KEY;

/**
 * Decrypt encrypted data using AES decryption.
 * @param {string} encryptedData - The data to be decrypted.
 * @returns {Object} - Object containing the decrypted data or an error message.
 */

export const decrypt = (encryptedData) => {
  try {
    // Attempt to decrypt the data using AES
    const bytes = CryptoJS.AES.decrypt(encryptedData, saltKey);

    if (bytes && bytes.sigBytes > 0) {
      // Parse the decrypted data as JSON
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if (decryptedData) {
        // Return the decrypted data if successful
        return { decryptedData };
      } else {
        // Throw an error if the decrypted data is empty or not a valid JSON
        throw new Error("Decrypted token is Empty or Invalid JSON");
      }
    } else {
      // Throw an error if the decryption resulted in empty bytes
      throw new Error("Decryption resulted in empty bytes.");
    }
  } catch (error) {
    // Return null if there is an error during decryption
    return { decryptedData: null };
  }
};

export const encrypt = (dataToEncrypt) => {
  // Encrypt the data using AES encryption
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(dataToEncrypt),
    saltKey
  ).toString();

  // Return the encrypted data
  return encrypted;
};
