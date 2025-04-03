import { QRIS } from '../src/qris';
import { SourceType, PaymentFeeCategory } from '../src/enums';
import { QRISReader } from '../src/helpers/reader';
import * as qrcode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
jest.mock('../src/helpers/reader');
jest.mock('qrcode');
jest.mock('fs');

describe('QRIS Class', () => {
  // Sample valid QRIS string for testing
  const validQRISString = '00020101021126330010A0000000050111021391239112341510105628138540715MerchantName520441235303360540510.005802ID5912MerchantName6007Jakarta6105401626304E649';
  
  // Common setup before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mocks for QRISReader
    (QRISReader.readFromFile as jest.Mock).mockResolvedValue(validQRISString);
    
    // Setup mocks for qrcode
    (qrcode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mockBase64Data');
    (qrcode.toString as jest.Mock).mockResolvedValue('Mock Terminal QR');
    (qrcode.toFile as jest.Mock).mockImplementation((path, data, callback) => {
      callback(null);
      return Promise.resolve();
    });
  });

  describe('Constructor and Setters', () => {
    test('should initialize with default values when no config is provided', () => {
      const qris = new QRIS({});
      expect((qris as any).sourceType).toBe(SourceType.CODE);
      expect((qris as any).sourceValue).toBeUndefined();
    });

    test('should initialize with provided config values', () => {
      const config = {
        sourceType: SourceType.IMAGE_PATH,
        sourceValue: 'path/to/image.png',
        merchantName: 'Test Merchant',
        merchantAddress: 'Test Address',
        merchantPostalCode: '12345',
        amount: 100,
        feeCategory: PaymentFeeCategory.FIXED,
        fee: 10,
        terminalLabel: 'Test Terminal'
      };
      
      const qris = new QRIS(config);
      
      expect((qris as any).sourceType).toBe(SourceType.IMAGE_PATH);
      expect((qris as any).sourceValue).toBe('path/to/image.png');
      expect((qris as any).merchantName).toBe('Test Merchant');
      expect((qris as any).merchantAddress).toBe('Test Address');
      expect((qris as any).merchantPostalCode).toBe('12345');
      expect((qris as any).amount).toBe(100);
      expect((qris as any).feeCategory).toBe(PaymentFeeCategory.FIXED);
      expect((qris as any).fee).toBe(10);
      expect((qris as any).terminalLabel).toBe('Test Terminal');
    });

    test('should allow setting merchant name', () => {
      const qris = new QRIS({});
      qris.setMerchantName('New Merchant');
      expect((qris as any).merchantName).toBe('New Merchant');
    });

    test('should allow setting merchant address', () => {
      const qris = new QRIS({});
      qris.setMerchantAddress('New Address');
      expect((qris as any).merchantAddress).toBe('New Address');
    });

    test('should allow setting merchant postal code', () => {
      const qris = new QRIS({});
      qris.setMerchantPostalCode('54321');
      expect((qris as any).merchantPostalCode).toBe('54321');
    });

    test('should allow setting amount', () => {
      const qris = new QRIS({});
      qris.setAmount(200);
      expect((qris as any).amount).toBe(200);
    });

    test('should allow setting fee category', () => {
      const qris = new QRIS({});
      qris.setFeeCategory(PaymentFeeCategory.PERCENT);
      expect((qris as any).feeCategory).toBe(PaymentFeeCategory.PERCENT);
    });

    test('should allow setting fee', () => {
      const qris = new QRIS({});
      qris.setFee(20);
      expect((qris as any).fee).toBe(20);
    });

    test('should allow setting terminal label', () => {
      const qris = new QRIS({});
      qris.setTerminalLabelCategory('New Terminal');
      expect((qris as any).terminalLabel).toBe('New Terminal');
    });
  });

  describe('Source Value Empty Check', () => {
    test('should return true for empty source value', () => {
      const qris = new QRIS({});
      expect((qris as any).sourceValueIsEmpty()).toBe(true);
      
      // Test with empty string
      (qris as any).sourceValue = '';
      expect((qris as any).sourceValueIsEmpty()).toBe(true);
    });

    test('should return false for non-empty source value', () => {
      const qris = new QRIS({ sourceValue: 'someValue' });
      expect((qris as any).sourceValueIsEmpty()).toBe(false);
    });
  });

  describe('Generate Method', () => {
    test('should throw error when source value is empty', async () => {
      const qris = new QRIS({});
      
      await expect(async () => {
        await (qris as any).readQR();
      }).rejects.toThrow('Source value is empty.');
    });

    test('should generate QR from image path', async () => {
      const qris = new QRIS({
        sourceType: SourceType.IMAGE_PATH,
        sourceValue: 'path/to/qr.png'
      });
      
      const result = await (qris as any).readQR();
      expect(QRISReader.readFromFile).toHaveBeenCalledWith('path/to/qr.png');
      expect(result).toBeTruthy();
    });

    test('should generate QR from code directly', async () => {
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const result = await (qris as any).readQR();
      expect(QRISReader.readFromFile).not.toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    test('should throw error for invalid percent fee (>100)', async () => {
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString,
        merchantName: 'Test Merchant',
        amount: 100,
        feeCategory: PaymentFeeCategory.PERCENT,
        fee: 150 // Greater than 100%
      });
      
      await expect(async () => {
        await (qris as any).readQR();
      }).rejects.toThrow('fee may not exceed 100%');
    });
  });

  describe('Public Methods', () => {
    test('generateQR should return QRIS string', async () => {
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const result = await qris.generateQR();
      expect(typeof result).toBe('string');
    });

    test('generateQRBase64 should return base64 image data', async () => {
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const result = await qris.generateQRBase64();
      expect(qrcode.toDataURL).toHaveBeenCalled();
      expect(result).toContain('data:image/png;base64');
    });

    test('generateQRTerminal should return terminal-friendly QR', async () => {
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const result = await qris.generateQRTerminal();
      expect(qrcode.toString).toHaveBeenCalledWith(expect.any(String), { type: 'terminal', small: true });
      expect(result).toBe('Mock Terminal QR');
    });

    test('generateQRFile should save file and return path', async () => {
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const outputPath = 'test-output.png';
      const result = await qris.generateQRFile(outputPath);
      
      expect(qrcode.toFile).toHaveBeenCalled();
      expect(result).toBe(outputPath);
    });

    test('generateQRFile should use default output path if none provided', async () => {
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const result = await qris.generateQRFile('');
      
      expect(qrcode.toFile).toHaveBeenCalled();
      expect(result).toBe('output.png');
    });
  });

  describe('Error Handling', () => {
    test('should handle errors when generating QR code', async () => {
      (QRISReader.readFromFile as jest.Mock).mockRejectedValue(new Error('Read error'));
      
      const qris = new QRIS({
        sourceType: SourceType.IMAGE_PATH,
        sourceValue: 'path/to/qr.png'
      });
      
      await expect(qris.generateQR()).rejects.toThrow();
    });

    test('should handle errors when generating base64', async () => {
      (qrcode.toDataURL as jest.Mock).mockRejectedValue(new Error('Base64 error'));
      
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const result = await qris.generateQRBase64();
      expect(result).toBeInstanceOf(Error);
    });

    test('should handle errors when generating terminal QR', async () => {
      (qrcode.toString as jest.Mock).mockRejectedValue(new Error('Terminal error'));
      
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      const result = await qris.generateQRTerminal();
      expect(result).toBeInstanceOf(Error);
    });

    test('should handle errors when generating file', async () => {
      (qrcode.toFile as jest.Mock).mockRejectedValue(new Error('File write error'));
      
      const qris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      });
      
      await expect(qris.generateQRFile('output.png')).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should modify merchant details in generated QR', async () => {
      const originalDetails = {
        sourceType: SourceType.CODE,
        sourceValue: validQRISString
      };
      
      const newDetails = {
        merchantName: 'New Merchant',
        merchantAddress: 'New City',
        merchantPostalCode: '54321',
        amount: 200,
        terminalLabel: 'Terminal01'
      };
      
      const qris = new QRIS(originalDetails);
      qris.setMerchantName(newDetails.merchantName);
      qris.setMerchantAddress(newDetails.merchantAddress);
      qris.setMerchantPostalCode(newDetails.merchantPostalCode);
      qris.setAmount(newDetails.amount);
      qris.setTerminalLabelCategory(newDetails.terminalLabel);
      
      const result = await qris.generateQR();
      expect(result).toContain(newDetails.merchantName);
    });
    
    test('should handle different fee categories', async () => {
      // Test with fixed fee
      const fixedFeeQris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString,
        amount: 100,
        feeCategory: PaymentFeeCategory.FIXED,
        fee: 10
      });
      
      await expect(fixedFeeQris.generateQR()).resolves.not.toThrow();
      
      // Test with percent fee
      const percentFeeQris = new QRIS({
        sourceType: SourceType.CODE,
        sourceValue: validQRISString,
        amount: 100,
        feeCategory: PaymentFeeCategory.PERCENT,
        fee: 5
      });
      
      await expect(percentFeeQris.generateQR()).resolves.not.toThrow();
    });
  });
}); 