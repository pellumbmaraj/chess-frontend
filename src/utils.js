import forge from "node-forge";
import CryptoJS from 'crypto-js';
import { io } from "socket.io-client";
import UserContext from "./context/Contexts/UserContext";
import { useContext } from "react";

/**
 * Function to generate RSA key pairs
 * @returns {Object} - Object that contains the public and private keys, used for AES key exchange
 */
const generateRSAKeys = () => {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);
    return { publicKey, privateKey };
}

/**
 * Function to decrypt the incoming encrypted AES key
 * @param {Buffer} AESKey - Encrypted AES key
 * @param {Buffer} privateKeyPem  - RSA private key
 * @returns {String} - Shared key 
*/
const decryptKey = (AESKey, privateKeyPem) => {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Decode base64-encoded encrypted AES key
    const encryptedBuffer = forge.util.decode64(AESKey);

    // Decrypt AES key using RSA private key
    const decryptedAESKey = privateKey.decrypt(encryptedBuffer, "RSA-OAEP", {
        md: forge.md.sha256.create(),  // Use SHA-256 for better security
    });
    return decryptedAESKey;
}

/**
 * Function to establish a connection with the server
 * @returns {String|null} - Decrypted AES key or null
 */
export const establishConnection = async () => {
    try {
        const response = await fetch("http://localhost:3000/establish-connection", {
            method: "GET",
            credentials: "include", 
        });

        if (!response.ok) {
            return response;
        }

        const RSAkeys = generateRSAKeys();

        try {
            const response = await fetch("http://localhost:3000/get-aes-key", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",  
                body: JSON.stringify({ publicKey: RSAkeys.publicKey }),
            });
    
            if (!response.ok) {
                return response;
            }
    
            const res = await response.json();
            const decryptedAESKey = decryptKey(res.aesKey, RSAkeys.privateKey);
            console.log(decryptedAESKey);
            return {
                AESKey: decryptedAESKey,
                publicKey: RSAkeys.publicKey,
                privateKey: RSAkeys.privateKey,
            };

        } catch (error) {
            return null;
        }
    } catch (error) {
        return null;
    }
}

/**
 * Function to encrypt a JSON object using AES-128-CBC
 * @param {Object} jsonData - JSON object to encrypt 
 * @param {String} key - AES shared key 
 * @returns {Object|null} - Encrypted data and IV in base64
 */
export const encryptAES_CBC = (jsonData, key) => {
    const keyWordArray = CryptoJS.enc.Utf8.parse(key);

    const iv = CryptoJS.lib.WordArray.random(16);

    const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(jsonData),
        keyWordArray,
        { iv: iv }
    );

    const base64EncryptedData = encryptedData.toString();
    const base64IV = iv.toString(CryptoJS.enc.Base64);

    return { encryptedData: base64EncryptedData, iv: base64IV };
};

/**
 * 
 * @param {Buffer} encryptedData - The encrypted data in base64 
 * @param {Buffer} iv - IV in base64 
 * @param {String} key - Shared AES key 
 * @returns {Object|null} - Returns the decrypted data or null
 */
export const decryptAES_CBC = (encryptedData, iv, key) => {
    try {
        // Convert Base64-encoded values back to WordArray
        const encryptedDataWordArray = CryptoJS.enc.Base64.parse(encryptedData);
        const ivWordArray = CryptoJS.enc.Base64.parse(iv);
        const keyWordArray = CryptoJS.enc.Utf8.parse(key);

        // Decrypt the data
        const decryptedData = CryptoJS.AES.decrypt(
            { ciphertext: encryptedDataWordArray }, // Ciphertext format
            keyWordArray,
            { iv: ivWordArray, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        // Convert decrypted data back to UTF-8 string
        const decryptedJsonString = CryptoJS.enc.Utf8.stringify(decryptedData);

        // Ensure decryption was successful
        if (!decryptedJsonString) return null;

        // Parse JSON and return
        return JSON.parse(decryptedJsonString);
    } catch (error) {
        return null;
    }
}

/**
 * Function to send the encrypted data to the server
 * @param {Object} data - Encrypted data and IV in base64 
 * @returns {Object|null} - The response object from server or null
 */
export const sendEncryptedDataToServer = async (route, data) => {
    try {
        const response = await fetch(`http://localhost:3000/${route}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                encryptedData: data.encryptedData,
                iv: data.iv,
            }),
        });

        const responseData = await response.json();

        console.log(responseData);

        return {
            status: response.status,
            data: responseData.data
        } 
    } catch (error) {
        return { error: "Request failed", details: error };
    }
};

const SOCKET_URL = "http://localhost:3000/";

const storedSocketId = localStorage.getItem("socketId");

if (!window.socket) {
    window.socket = io(SOCKET_URL);

    window.socket.on("connect", () => {
        console.log("Socket connected:", window.socket.id);
        localStorage.setItem("socketId", window.socket.id);
    });

    window.socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        localStorage.removeItem("socketId");
    });

    window.addEventListener("beforeunload", () => {
        window.socket.disconnect();
    });
}

export const getSocket = () => window.socket;


