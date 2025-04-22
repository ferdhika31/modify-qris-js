// tests/qris.test.ts
import { QRIS } from '../src/qris';
import { Config } from '../src/config';
import { SourceType, PaymentFeeCategory } from '../src/enums';
import { QRISReader } from '../src/helpers/reader';
import * as qrcode from 'qrcode';

// Mock dependencies
jest.mock('qrcode');
jest.mock('../src/helpers/reader');

describe('QRIS Class', () => {
    const validQRISString = '00020101021126740025ID.CO.BANKNEOCOMMERCE.WWW011893600490594025501202120005900565650303UMI51550025ID.CO.BANKNEOCOMMERCE.WWW0215ID10232469816180303UMI5204541153033605802ID5910DHKA STORE6013BANDUNG BARAT6105403916233052230016985445676624117760703T0163042900';
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mocks
        (qrcode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mockdata');
        (qrcode.toString as jest.Mock).mockResolvedValue('mock-terminal-qr');
        (qrcode.toFile as jest.Mock).mockResolvedValue('mock-file-path');
        (QRISReader.readFromFile as jest.Mock).mockResolvedValue(validQRISString);
    });

    describe('Constructor', () => {
        test('should initialize with default values', () => {
            const qris = new QRIS({});
            expect((qris as any).sourceType).toBe(SourceType.CODE);
        });

        test('should initialize with provided config values', () => {
            const config: Config = {
                sourceType: SourceType.CODE,
                sourceValue: validQRISString,
                merchantName: 'Test Merchant',
                merchantAddress: 'Test Address',
                merchantPostalCode: '12345',
                amount: 1000,
                feeCategory: PaymentFeeCategory.FIXED,
                fee: 10,
                terminalLabel: 'Test Terminal'
            };

            const qris = new QRIS(config);

            expect((qris as any).sourceType).toBe(SourceType.CODE);
            expect((qris as any).sourceValue).toBe(validQRISString);
            expect((qris as any).merchantName).toBe('Test Merchant');
            expect((qris as any).merchantAddress).toBe('Test Address');
            expect((qris as any).merchantPostalCode).toBe('12345');
            expect((qris as any).amount).toBe(1000);
            expect((qris as any).feeCategory).toBe(PaymentFeeCategory.FIXED);
            expect((qris as any).fee).toBe(10);
            expect((qris as any).terminalLabel).toBe('Test Terminal');
        });
    });

    describe('Setter Methods', () => {
        let qris: QRIS;

        beforeEach(() => {
            qris = new QRIS({});
        });

        test('setMerchantName should set merchant name', () => {
            qris.setMerchantName('New Merchant');
            expect((qris as any).merchantName).toBe('New Merchant');
        });

        test('setMerchantAddress should set merchant address', () => {
            qris.setMerchantAddress('New Address');
            expect((qris as any).merchantAddress).toBe('New Address');
        });

        test('setMerchantPostalCode should set merchant postal code', () => {
            qris.setMerchantPostalCode('54321');
            expect((qris as any).merchantPostalCode).toBe('54321');
        });

        test('setAmount should set amount', () => {
            qris.setAmount(2000);
            expect((qris as any).amount).toBe(2000);
        });

        test('setFeeCategory should set fee category', () => {
            qris.setFeeCategory(PaymentFeeCategory.PERCENT);
            expect((qris as any).feeCategory).toBe(PaymentFeeCategory.PERCENT);
        });

        test('setFee should set fee', () => {
            qris.setFee(20);
            expect((qris as any).fee).toBe(20);
        });

        test('setTerminalLabelCategory should set terminal label', () => {
            qris.setTerminalLabelCategory('New Terminal');
            expect((qris as any).terminalLabel).toBe('New Terminal');
        });
    });

    describe('QR Generation Methods', () => {
        test('generateQR should generate QR string from code', async () => {
            const qris = new QRIS({
                sourceType: SourceType.CODE,
                sourceValue: validQRISString
            });

            const result = await qris.generateQR();
            expect(result).toBe(validQRISString);
        });

        test('generateQR should generate QR string from image path', async () => {
            const qris = new QRIS({
                sourceType: SourceType.IMAGE_PATH,
                sourceValue: 'test.png'
            });

            const result = await qris.generateQR();
            expect(QRISReader.readFromFile).toHaveBeenCalledWith('test.png');
            expect(result).toBe(validQRISString);
        });

        test('generateQRBase64 should generate base64 QR image', async () => {
            const qris = new QRIS({
                sourceType: SourceType.CODE,
                sourceValue: validQRISString
            });

            const result = await qris.generateQRBase64();
            expect(qrcode.toDataURL).toHaveBeenCalled();
            expect(result).toBe('data:image/png;base64,mockdata');
        });

        test('generateQRTerminal should generate terminal QR', async () => {
            const qris = new QRIS({
                sourceType: SourceType.CODE,
                sourceValue: validQRISString
            });

            const result = await qris.generateQRTerminal();
            expect(qrcode.toString).toHaveBeenCalled();
            expect(result).toBe('mock-terminal-qr');
        });

        test('generateQRFile should generate QR file', async () => {
            const qris = new QRIS({
                sourceType: SourceType.CODE,
                sourceValue: validQRISString
            });

            const result = await qris.generateQRFile('output.png');
            expect(qrcode.toFile).toHaveBeenCalledWith('output.png', expect.any(String));
            expect(result).toBe('output.png');
        });

        test('should throw error when source value is empty', async () => {
            const qris = new QRIS({
                sourceType: SourceType.CODE
            });

            await expect(qris.generateQR()).rejects.toThrow();
        });
    });

    describe('Error Handling', () => {
        test('should handle file reading errors', async () => {
            const qris = new QRIS({
                sourceType: SourceType.IMAGE_PATH,
                sourceValue: 'nonexistent.png'
            });

            (QRISReader.readFromFile as jest.Mock).mockRejectedValue(new Error('File not found'));
            await expect(qris.generateQR()).rejects.toThrow('File not found');
        });
    });
});