import { createCanvas, loadImage } from 'canvas';
import jsQR from 'jsqr';
import * as fs from 'fs';
import * as path from 'path';

export class QRISReader {
    /**
     * Read QR Code from image file
     * @param imagePath Path to the image file
     * @returns Promise<string> QR Code content
     */
    public static async readFromFile(imagePath: string): Promise<string> {
        try {
            // Check if file exists
            if (!fs.existsSync(imagePath)) {
                throw new Error(`File not found: ${imagePath}`);
            }

            // Check if file is readable
            try {
                fs.accessSync(imagePath, fs.constants.R_OK);
            } catch (error) {
                throw new Error(`File is not readable: ${imagePath}`);
            }

            // Load image
            const image = await loadImage(imagePath);
            
            // Create canvas
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            
            // Draw image to canvas
            ctx.drawImage(image, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Decode QR Code
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (!code) {
                throw new Error('No QR Code found in image');
            }
            
            return code.data;
        } catch (error) {
            throw new Error(`Failed to read QR Code: ${error.message}`);
        }
    }

    /**
     * Read QR Code from base64 image
     * @param base64Image Base64 encoded image string
     * @returns Promise<string> QR Code content
     */
    public static async readFromBase64(base64Image: string): Promise<string> {
        try {
            // Remove data URL prefix if present
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
            
            // Validate base64 string
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
                throw new Error('Invalid base64 string');
            }
            
            // Create buffer from base64
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Load image from buffer
            const image = await loadImage(buffer);
            
            // Create canvas
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            
            // Draw image to canvas
            ctx.drawImage(image, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Decode QR Code
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (!code) {
                throw new Error('No QR Code found in image');
            }
            
            return code.data;
        } catch (error) {
            throw new Error(`Failed to read QR Code: ${error.message}`);
        }
    }

    /**
     * Validate if the content is a valid QRIS
     * @param content QR Code content
     * @returns boolean
     */
    public static isValidQRIS(content: string): boolean {
        // Basic QRIS validation
        // Check if it starts with 000201
        if (!content.startsWith('000201')) {
            return false;
        }

        // Check if it contains required fields
        const requiredFields = ['26', '52', '53', '54', '58', '59', '60', '61'];
        for (const field of requiredFields) {
            if (!content.includes(field)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Ensure directory exists
     * @param dirPath Directory path
     */
    public static ensureDirectoryExists(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
} 