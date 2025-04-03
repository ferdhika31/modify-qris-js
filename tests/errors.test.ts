import { QRISError, QRISParseError, ErrorCode } from '../src/errors';

describe('QRIS Error Classes', () => {
  describe('QRISError', () => {
    test('should create error with message', () => {
      const error = new QRISError('Test error message');
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('QRISError');
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    test('should create error with code', () => {
      const error = new QRISError('Test error message', ErrorCode.FEE_EXCEEDED);
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe(ErrorCode.FEE_EXCEEDED);
      expect(error.details).toBeUndefined();
    });

    test('should create error with details', () => {
      const details = { maxFee: 100, currentFee: 150 };
      const error = new QRISError('Test error message', ErrorCode.FEE_EXCEEDED, details);
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe(ErrorCode.FEE_EXCEEDED);
      expect(error.details).toEqual(details);
    });

    test('should properly set stack trace', () => {
      const error = new QRISError('Test error message');
      expect(error.stack).toBeDefined();
    });
  });

  describe('QRISParseError', () => {
    test('should create parse error with message', () => {
      const error = new QRISParseError('Parse error message');
      expect(error.message).toBe('Parse error message');
      expect(error.name).toBe('QRISParseError');
      expect(error.tag).toBeUndefined();
      expect(error.position).toBeUndefined();
      expect(error.rawData).toBeUndefined();
    });

    test('should create parse error with tag', () => {
      const error = new QRISParseError('Parse error message', '01');
      expect(error.message).toBe('Parse error message');
      expect(error.tag).toBe('01');
    });

    test('should create parse error with position', () => {
      const error = new QRISParseError('Parse error message', '01', 10);
      expect(error.message).toBe('Parse error message');
      expect(error.tag).toBe('01');
      expect(error.position).toBe(10);
    });

    test('should create parse error with raw data', () => {
      const error = new QRISParseError('Parse error message', '01', 10, 'RAW_DATA');
      expect(error.message).toBe('Parse error message');
      expect(error.tag).toBe('01');
      expect(error.position).toBe(10);
      expect(error.rawData).toBe('RAW_DATA');
    });

    test('should properly set stack trace', () => {
      const error = new QRISParseError('Parse error message');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ErrorCode Enum', () => {
    test('should contain all expected error codes', () => {
      expect(ErrorCode.SOURCE_NOT_FOUND).toBeDefined();
      expect(ErrorCode.INVALID_QR).toBeDefined();
      expect(ErrorCode.FEE_EXCEEDED).toBeDefined();
      expect(ErrorCode.UNSUPPORTED_FORMAT).toBeDefined();
      expect(ErrorCode.FILE_WRITE_ERROR).toBeDefined();
      expect(ErrorCode.UNKNOWN_ERROR).toBeDefined();
      expect(ErrorCode.QRIS_TO_SHORT).toBeDefined();
      expect(ErrorCode.FORMAT_TO_LONG).toBeDefined();
    });
  });

  describe('Error Inheritance', () => {
    test('QRISError should be instance of Error', () => {
      const error = new QRISError('Test message');
      expect(error).toBeInstanceOf(Error);
    });

    test('QRISParseError should be instance of Error', () => {
      const error = new QRISParseError('Test message');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Error Integration', () => {
    test('Error should be catchable in try/catch', () => {
      const testFn = () => {
        throw new QRISError('Test error', ErrorCode.FEE_EXCEEDED);
      };

      try {
        testFn();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(QRISError);
        expect(error.code).toBe(ErrorCode.FEE_EXCEEDED);
      }
    });

    test('QRISError should work with async/await', async () => {
      const asyncFn = async () => {
        throw new QRISError('Async error', ErrorCode.SOURCE_NOT_FOUND);
      };

      await expect(asyncFn()).rejects.toThrow('Async error');
      await expect(asyncFn()).rejects.toBeInstanceOf(QRISError);
    });
  });
}); 