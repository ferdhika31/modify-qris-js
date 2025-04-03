import { QRISReader } from '../src/helpers/reader';
import * as fs from 'fs';
import * as path from 'path';
import * as jsQR from 'jsqr';
import * as jimp from 'jimp';

// Mock dependencies
jest.mock('fs');
jest.mock('jsqr');
jest.mock('jimp');

describe('QRISReader', () => {
  // Sample QRIS string for testing
  const sampleQRISString = '00020101021126330010A0000000050111021391239112341510105628138540715MerchantName520441235303360540510.005802ID5912MerchantName6007Jakarta6105401626304E649';
  
  // Sample image data
  const sampleImageWidth = 100;
  const sampleImageHeight = 100;
  const sampleImageData = new Uint8ClampedArray(sampleImageWidth * sampleImageHeight * 4);

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup jimp mock
    (jimp.read as jest.Mock).mockResolvedValue({
      bitmap: {
        width: sampleImageWidth,
        height: sampleImageHeight,
        data: sampleImageData
      }
    });
    
    // Setup jsQR mock
    (jsQR as unknown as jest.Mock).mockReturnValue({
      data: sampleQRISString
    });
    
    // Setup fs mock
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  describe('readFromFile Method', () => {
    test('should throw error if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      await expect(QRISReader.readFromFile('non-existent-file.png')).rejects.toThrow();
    });

    test('should read QR code from file successfully', async () => {
      const filePath = 'test-qr.png';
      
      const result = await QRISReader.readFromFile(filePath);
      
      expect(jimp.read).toHaveBeenCalledWith(filePath);
      expect(jsQR).toHaveBeenCalled();
      expect(result).toBe(sampleQRISString);
    });

    test('should throw error if QR code is not found in image', async () => {
      (jsQR as unknown as jest.Mock).mockReturnValue(null);
      
      await expect(QRISReader.readFromFile('test-qr.png')).rejects.toThrow('QR code not found in image');
    });

    test('should handle jimp errors', async () => {
      (jimp.read as jest.Mock).mockRejectedValue(new Error('Image processing error'));
      
      await expect(QRISReader.readFromFile('test-qr.png')).rejects.toThrow('Image processing error');
    });
  });

  describe('Path Resolution', () => {
    test('should handle relative paths', async () => {
      const relativePath = './qr-code.png';
      
      await QRISReader.readFromFile(relativePath);
      
      expect(jimp.read).toHaveBeenCalledWith(relativePath);
    });

    test('should handle absolute paths', async () => {
      const absolutePath = '/absolute/path/to/qr-code.png';
      
      await QRISReader.readFromFile(absolutePath);
      
      expect(jimp.read).toHaveBeenCalledWith(absolutePath);
    });
  });

  describe('Integration', () => {
    test('should process different image formats', async () => {
      // PNG format
      await QRISReader.readFromFile('qr-code.png');
      expect(jimp.read).toHaveBeenCalledWith('qr-code.png');
      
      // JPEG format
      await QRISReader.readFromFile('qr-code.jpg');
      expect(jimp.read).toHaveBeenCalledWith('qr-code.jpg');
      
      // BMP format
      await QRISReader.readFromFile('qr-code.bmp');
      expect(jimp.read).toHaveBeenCalledWith('qr-code.bmp');
    });
  });
}); 