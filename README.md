# QRIS Dynamic JS

A robust JavaScript/TypeScript library for generating and manipulating QRIS (QR Code Indonesian Standard) codes. This library enables easy creation, modification, and validation of QRIS QR codes with comprehensive error handling.

## Features

- ✅ Dynamic QRIS QR code generation
- ✅ Static QRIS QR code support
- ✅ Multiple output formats (string, terminal, base64, PNG file)
- ✅ Comprehensive error handling
- ✅ QRIS validation according to ASPI standards
- ✅ Fee calculations (fixed and percentage)
- ✅ TypeScript support with complete type definitions
- ✅ Merchant information customization
- ✅ CRC validation and generation

## Installation

```bash
npm install modify-qris-js
```

## Quick Start

### Basic Usage

```typescript
import { QRIS, SourceType, PaymentFeeCategory } from 'modify-qris-js';
import path from 'path';

// Initialize QRIS with configuration
const qris = new QRIS({
    sourceType: SourceType.CODE,  // Directly use a QRIS code string
    sourceValue: '00020101021226...', // Your QRIS string
    merchantName: 'My Store',
    merchantAddress: 'Jakarta',
    merchantPostalCode: '12345',
    amount: 25000,  // In the smallest currency unit (e.g., IDR)
    feeCategory: PaymentFeeCategory.FIXED,
    fee: 1000,
    terminalLabel: 'A01',
});

// Generate QR code and save to file
qris.generateQRFile('output.png')
    .then(filePath => {
        console.log(`QR code saved to: ${filePath}`);
    })
    .catch(error => {
        console.error('Error generating QR code:', error.message);
    });
```

### Reading from an Existing QR Image

```typescript
import { QRIS, SourceType } from 'modify-qris-js';
import path from 'path';

// Initialize QRIS from an image
const qris = new QRIS({
    sourceType: SourceType.IMAGE_PATH,
    sourceValue: path.join(__dirname, 'existing-qr.png'),
    merchantName: 'New Merchant Name',  // Override merchant name
    amount: 50000,  // Set a fixed amount
});

// Generate different outputs
async function generateOutputs() {
    try {
        // Get QRIS as a string
        const qrString = await qris.generateQR();
        console.log('QRIS string:', qrString);

        // Get QRIS as base64 for web display
        const qrBase64 = await qris.generateQRBase64();
        console.log('QRIS base64:', qrBase64.substring(0, 50) + '...');

        // Get QRIS as terminal-friendly ASCII art
        const qrTerminal = await qris.generateQRTerminal();
        console.log('QRIS terminal output:', qrTerminal);

        // Save QRIS to a file
        const filePath = await qris.generateQRFile('modified-qr.png');
        console.log('QRIS saved to:', filePath);
    } catch (error) {
        console.error('Error processing QRIS:', error);
    }
}

generateOutputs();
```

## Error Handling

The library provides robust error handling with detailed error codes and messages:

```typescript
import { QRIS, SourceType, PaymentFeeCategory } from 'modify-qris-js';

// Example with proper error handling
try {
    const qris = new QRIS({
        sourceType: SourceType.IMAGE_PATH,
        sourceValue: 'non-existent-file.png',
        merchantName: 'My Store',
        feeCategory: PaymentFeeCategory.PERCENT,
        fee: 200, // Will cause an error (over 100%)
    });

    await qris.generateQRFile('output.png');
} catch (error) {
    // Check for specific error types
    if (error.message.includes('fee may not exceed 100')) {
        console.error('Fee percentage must be 100 or lower');
    } else if (error.message.includes('no such file')) {
        console.error('Source file not found');
    } else {
        console.error('Error generating QR code:', error.message);
    }
}
```

### Custom Error Handling

For more advanced error handling, you can create a custom error handler function:

```typescript
// Custom error handler function
function handleQRISError(error) {
  // Extract error details
  const code = error.code || 'UNKNOWN_ERROR';
  const message = error.message || 'An unknown error occurred';
  
  // Handle specific error types
  switch (code) {
    case 'FEE_EXCEEDED':
      console.error('Fee Error: The percentage fee cannot exceed 100%');
      // Take corrective action
      break;
    case 'SOURCE_NOT_FOUND':
      console.error('File Error: The source QR file could not be found');
      // Suggest alternative file paths
      break;
    case 'VALIDATION_FAILED':
      console.error('Validation Error:', message);
      // Log detailed validation errors
      if (error.details) {
        console.error('Validation details:', error.details);
      }
      break;
    default:
      console.error(`QRIS Error (${code}):`, message);
  }
  
  // Log error for diagnostic purposes
  console.debug('Error details:', error);
}

// Use the custom handler
try {
  const qris = new QRIS({/*...*/});
  await qris.generateQRFile('output.png');
} catch (error) {
  handleQRISError(error);
}
```

## Configuration Options

| `sourceType` | `string` | Source type (`CODE` or `IMAGE_PATH`) | `CODE` |
| `sourceValue` | `string` | QRIS code string or image path | - |
| `merchantName` | `string` | Merchant name to display | - |
| `merchantAddress` | `string` | Merchant address/city | - |
| `merchantPostalCode` | `string` | Merchant postal code | - |
| `amount` | `number` | Transaction amount (0 for dynamic amount) | 0 |
| `feeCategory` | `string` | Fee category (`FIXED` or `PERCENT`) | - |
| `fee` | `number` | Fee amount (max 100 if PERCENT) | 0 |
| `terminalLabel` | `string` | Custom terminal label | - |

## API Reference

The library provides a simple API for working with QRIS codes:

### Methods

#### Generation Methods

- `generateQR()`: Generates QRIS code as a string
- `generateQRBase64()`: Generates QRIS code as base64 image
- `generateQRTerminal()`: Generates QRIS code as ASCII art for terminal display
- `generateQRFile(output: string)`: Generates and saves QRIS code to a file

#### Configuration Setters

- `setMerchantName(name: string)`
- `setMerchantAddress(address: string)`
- `setMerchantPostalCode(postalCode: string)`
- `setAmount(amount: number)`
- `setFeeCategory(feeCategory: string)`
- `setFee(fee: number)`
- `setTerminalLabelCategory(label: string)`

For detailed API documentation, please refer to [API.md](docs/API.md).

## Important Note

⚠️ **Use Responsibly**

QRIS (QR Code Indonesian Standard) is governed by standards and regulations set by Bank Indonesia and ASPI (Asosiasi Sistem Pembayaran Indonesia). This library is provided for legitimate business and development purposes only.

Please use this library responsibly and ensure that any QRIS codes you generate comply with relevant regulations and standards. The library creators are not responsible for any misuse or for QR codes that do not conform to the official QRIS specifications.

When implementing this in production environments, always:
- Test thoroughly with small transaction amounts
- Validate your QRIS implementations with your payment service provider
- Follow security best practices when handling payment information
- Ensure your implementation complies with the latest QRIS standards
- Do not use this library for fraudulent or misleading purposes

## Known Limitations

- The library currently supports QRIS specification version 1.0
- Some advanced QRIS features like loyalty programs may not be fully implemented
- Not all QRIS acquirer-specific extensions are supported
- QR code reading capabilities depend on the quality of the source image

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for discussion.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2025 Ferdhika Yudira