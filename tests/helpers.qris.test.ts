import { QRIS } from '../src/helpers/qris';
import { QRISParseError } from '../src/errors';
import { QRISTags, AcquirerDetailTags, SwitchingDetailTags, AdditionalInformationTags } from '../src/enums';

describe('QRIS Helper Class', () => {
  describe('sanitize Method', () => {
    test('should remove newlines and carriage returns', () => {
      const input = 'Test\nString\r\nWith\rNewlines';
      const result = QRIS.sanitize(input);
      expect(result).toBe('TestStringWithNewlines');
    });

    test('should trim whitespace', () => {
      const input = '  Padded String  ';
      const result = QRIS.sanitize(input);
      expect(result).toBe('Padded String');
    });

    test('should handle empty string', () => {
      const input = '';
      const result = QRIS.sanitize(input);
      expect(result).toBe('');
    });

    test('should handle string with only whitespace', () => {
      const input = '   \n\r   ';
      const result = QRIS.sanitize(input);
      expect(result).toBe('');
    });
  });

  describe('parseTag Method', () => {
    test('should throw error when code string is too short', () => {
      expect(() => {
        QRIS.parseTag('0102');
      }).toThrow(QRISParseError);
      
      expect(() => {
        QRIS.parseTag('0102');
      }).toThrow('QRIS code is too short');
    });

    test('should throw error when length code is invalid', () => {
      expect(() => {
        QRIS.parseTag('01xx56789');
      }).toThrow(QRISParseError);
      
      expect(() => {
        QRIS.parseTag('01xx56789');
      }).toThrow('Format data length is invalid');
    });

    test('should throw error when content length does not match', () => {
      expect(() => {
        QRIS.parseTag('010512');
      }).toThrow(QRISParseError);
      
      expect(() => {
        QRIS.parseTag('010512');
      }).toThrow('Data length does not match');
    });

    test('should correctly parse valid tag', () => {
      const result = QRIS.parseTag('0105Hello');
      expect(result).toEqual({
        tag: '01',
        content: 'Hello',
        data: '0105Hello'
      });
    });
  });

  describe('modifyContent Method', () => {
    test('should return empty object for empty content', () => {
      const data = { tag: '01', content: 'Original', data: '0108Original' };
      const result = QRIS.modifyContent(data, '');
      
      expect(result).toEqual({
        tag: '',
        content: '',
        data: ''
      });
    });

    test('should modify content and update length', () => {
      const data = { tag: '01', content: 'Original', data: '0108Original' };
      const result = QRIS.modifyContent(data, 'NewContent');
      
      expect(result).toEqual({
        tag: '01',
        content: 'NewContent',
        data: '0110NewContent'
      });
    });

    test('should handle single digit length', () => {
      const data = { tag: '01', content: 'Original', data: '0108Original' };
      const result = QRIS.modifyContent(data, 'X');
      
      expect(result).toEqual({
        tag: '01',
        content: 'X',
        data: '0101X'
      });
    });
  });

  describe('parseAquirerDetail Method', () => {
    test('should parse acquirer details', () => {
      // Create a mock valid acquirer detail string
      const site = AcquirerDetailTags.SITE + '03' + 'ABC';
      const mpan = AcquirerDetailTags.MPAN + '04' + '1234';
      const terminalId = AcquirerDetailTags.TERMINAL_ID + '02' + 'XY';
      const category = AcquirerDetailTags.CATEGORY + '01' + '0';
      
      const acquirerString = site + mpan + terminalId + category;
      
      const result = QRIS.parseAquirerDetail(acquirerString);
      
      expect(result.site).toBeDefined();
      expect(result.site?.tag).toBe(AcquirerDetailTags.SITE);
      expect(result.site?.content).toBe('ABC');
      
      expect(result.mpan).toBeDefined();
      expect(result.mpan?.tag).toBe(AcquirerDetailTags.MPAN);
      expect(result.mpan?.content).toBe('1234');
      
      expect(result.terminal_id).toBeDefined();
      expect(result.terminal_id?.tag).toBe(AcquirerDetailTags.TERMINAL_ID);
      expect(result.terminal_id?.content).toBe('XY');
      
      expect(result.category).toBeDefined();
      expect(result.category?.tag).toBe(AcquirerDetailTags.CATEGORY);
      expect(result.category?.content).toBe('0');
    });

    test('should throw error for invalid acquirer detail', () => {
      const invalidAcquirerString = AcquirerDetailTags.SITE + 'XX' + 'ABC';
      
      expect(() => {
        QRIS.parseAquirerDetail(invalidAcquirerString);
      }).toThrow('Failed to parse Aquirer Detail');
    });
  });

  describe('parseSwitchingDetail Method', () => {
    test('should parse switching details', () => {
      // Create a mock valid switching detail string
      const site = SwitchingDetailTags.SITE + '03' + 'DEF';
      const nmid = SwitchingDetailTags.NMID + '04' + '5678';
      const category = SwitchingDetailTags.CATEGORY + '01' + '1';
      
      const switchingString = site + nmid + category;
      
      const result = QRIS.parseSwitchingDetail(switchingString);
      
      expect(result.site).toBeDefined();
      expect(result.site?.tag).toBe(SwitchingDetailTags.SITE);
      expect(result.site?.content).toBe('DEF');
      
      expect(result.nmid).toBeDefined();
      expect(result.nmid?.tag).toBe(SwitchingDetailTags.NMID);
      expect(result.nmid?.content).toBe('5678');
      
      expect(result.category).toBeDefined();
      expect(result.category?.tag).toBe(SwitchingDetailTags.CATEGORY);
      expect(result.category?.content).toBe('1');
    });

    test('should throw error for invalid switching detail', () => {
      const invalidSwitchingString = SwitchingDetailTags.SITE + 'XX' + 'DEF';
      
      expect(() => {
        QRIS.parseSwitchingDetail(invalidSwitchingString);
      }).toThrow('Failed to parse Switching Detail');
    });
  });

  describe('parseAdditionalInformationDetail Method', () => {
    test('should parse additional information details', () => {
      // Create a mock valid additional information detail string
      const billNumber = AdditionalInformationTags.BILL_NUMBER + '04' + 'B123';
      const mobileNumber = AdditionalInformationTags.MOBILE_NUMBER + '10' + '0812345678';
      const terminalLabel = AdditionalInformationTags.TERMINAL_LABEL + '03' + 'T01';
      
      const additionalInfoString = billNumber + mobileNumber + terminalLabel;
      
      const result = QRIS.parseAdditionalInformationDetail(additionalInfoString);
      
      expect(result.bill_number).toBeDefined();
      expect(result.bill_number?.tag).toBe(AdditionalInformationTags.BILL_NUMBER);
      expect(result.bill_number?.content).toBe('B123');
      
      expect(result.mobile_number).toBeDefined();
      expect(result.mobile_number?.tag).toBe(AdditionalInformationTags.MOBILE_NUMBER);
      expect(result.mobile_number?.content).toBe('0812345678');
      
      expect(result.terminal_label).toBeDefined();
      expect(result.terminal_label?.tag).toBe(AdditionalInformationTags.TERMINAL_LABEL);
      expect(result.terminal_label?.content).toBe('T01');
    });

    test('should handle RFU tags', () => {
      // Assuming RFU tags are correctly defined in the enum
      const rfuTag = '91'; // Example RFU tag
      const rfuString = rfuTag + '05' + 'RFUXX';
      
      const result = QRIS.parseAdditionalInformationDetail(rfuString);
      
      expect(result.rfu).toBeDefined();
      // Additional assertions for RFU content can be added here
    });
  });

  describe('isValid Method', () => {
    test('should validate a complete QRIS entity and return no errors', () => {
      // Create a minimally valid QRIS entity
      const qrisEntity = {
        version: { tag: QRISTags.VERSION, content: '01', data: QRISTags.VERSION + '01' + '01' },
        acquirer: {
          tag: QRISTags.ACQUIRER,
          content: '0123456',
          data: QRISTags.ACQUIRER + '07' + '0123456',
          detail: {
            site: null,
            mpan: null,
            terminal_id: null,
            category: null
          }
        },
        merchant_category_code: { tag: QRISTags.MERCHANT_CATEGORY_CODE, content: '5499', data: QRISTags.MERCHANT_CATEGORY_CODE + '04' + '5499' },
        currency_code: { tag: QRISTags.CURRENCY_CODE, content: '360', data: QRISTags.CURRENCY_CODE + '03' + '360' },
        country_code: { tag: QRISTags.COUNTRY_CODE, content: 'ID', data: QRISTags.COUNTRY_CODE + '02' + 'ID' },
        merchant_name: { tag: QRISTags.MERCHANT_NAME, content: 'Merchant', data: QRISTags.MERCHANT_NAME + '08' + 'Merchant' },
        merchant_city: { tag: QRISTags.MERCHANT_CITY, content: 'City', data: QRISTags.MERCHANT_CITY + '04' + 'City' },
        merchant_postal_code: { tag: QRISTags.MERCHANT_POSTAL_CODE, content: '12345', data: QRISTags.MERCHANT_POSTAL_CODE + '05' + '12345' },
        additional_information: {
          tag: QRISTags.ADDITIONAL_INFORMATION,
          content: '',
          data: QRISTags.ADDITIONAL_INFORMATION + '00',
          detail: {
            bill_number: null,
            mobile_number: null,
            store_label: null,
            loyalty_number: null,
            reference_label: null,
            customer_label: null,
            terminal_label: null,
            purpose_of_transaction: null,
            additional_consumer_data_request: null,
            merchant_tax_id: null,
            merchant_channel: null,
            rfu: null,
            payment_system_specific: null
          }
        },
        crc_code: { tag: QRISTags.CRC_CODE, content: '1234', data: QRISTags.CRC_CODE + '04' + '1234' },
        
        // Optional fields
        category: null,
        payment_amount: null,
        payment_fee_category: null,
        payment_fee: null,
        acquirer_bank_transfer: null,
        switching: null
      };
      
      const errors = QRIS.isValid(qrisEntity);
      expect(errors.length).toBe(0);
    });

    test('should return errors for invalid QRIS entity', () => {
      // Create an invalid QRIS entity (missing required fields)
      const invalidQrisEntity = {
        version: { tag: QRISTags.VERSION, content: '01', data: QRISTags.VERSION + '01' + '01' },
        // Missing acquirer
        merchant_category_code: null,
        currency_code: null,
        // Missing other required fields
        acquirer: null,
        country_code: null,
        merchant_name: null,
        merchant_city: null,
        merchant_postal_code: null,
        additional_information: null,
        crc_code: null,
        
        // Optional fields
        category: null,
        payment_amount: null,
        payment_fee_category: null,
        payment_fee: null,
        acquirer_bank_transfer: null,
        switching: null
      };
      
      const errors = QRIS.isValid(invalidQrisEntity);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
}); 