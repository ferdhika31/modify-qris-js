# QRIS Dynamic JS API Documentation

## Table of Contents
- [Configuration](#configuration)
- [QRIS Class](#qris-class)
- [Methods](#methods)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

## Configuration

### Config Interface

```typescript
interface Config {
    sourceType?: string;
    sourceValue?: string;
    merchantName?: string;
    merchantAddress?: string;
    merchantPostalCode?: string;
    amount?: number;
    feeCategory?: string;
    fee?: number;
}
```

All properties in the Config interface are optional. Default values will be used if not provided.

## QRIS Class

### Constructor

```typescript
constructor(config: Config)
```

The constructor accepts a configuration object that implements the Config interface.

### Properties

- `sourceType`: string - QRIS source type (default: 'CODE')
- `sourceValue`: string - QRIS source value
- `merchantName`: string - Merchant name
- `merchantAddress`: string - Merchant address
- `merchantPostalCode`: string - Merchant postal code
- `amount`: number - Payment amount
- `feeCategory`: string - Fee category
- `fee`: number - Fee amount
- `terminalLabel`: string - Terminal label

## Methods

### Setter Methods

#### setMerchantName
```typescript
setMerchantName(merchantName: string): void
```
Sets the merchant name.

#### setMerchantAddress
```typescript
setMerchantAddress(merchantAddress: string): void
```
Sets the merchant address.

#### setMerchantPostalCode
```typescript
setMerchantPostalCode(merchantPostalCode: string): void
```
Sets the merchant postal code.

#### setAmount
```typescript
setAmount(amount: number): void
```
Sets the payment amount.

#### setFeeCategory
```typescript
setFeeCategory(feeCategory: string): void
```
Sets the fee category ('FIXED' or 'PERCENT').

#### setFee
```typescript
setFee(fee: number): void
```
Sets the fee amount.

#### setTerminalLabelCategory
```typescript
setTerminalLabelCategory(terminalLabel: string): void
```
Sets the terminal label.

### Generator Methods

#### generateQR
```typescript
generateQR(): Promise<string>
```
Generates a QRIS QR Code string.

#### generateQRBase64
```typescript
generateQRBase64(): Promise<string>
```
Generates a QRIS QR Code in base64 format.

#### generateQRTerminal
```typescript
generateQRTerminal(): Promise<string>
```
Generates a QRIS QR Code for terminal display.

#### generateQRFile
```typescript
generateQRFile(output: string): Promise<string>
```
Generates a QRIS QR Code file.

## Error Handling

The library will throw errors in the following cases:

1. Empty source value
2. QRIS validation failure
3. QR Code generation failure

Error handling example:

```typescript
try {
    const qris = new QRIS(config);
    const qrString = await qris.generateQR();
} catch (error) {
    console.error('Error generating QR Code:', error);
}
```

## Usage Examples

### Example 1: Basic QR Code Generation

```typescript
import { QRIS } from 'qris-dynamic-js';
import { Config } from 'qris-dynamic-js/config';

const config: Config = {
    sourceValue: '00020101021226',
    merchantName: 'Store ABC',
    amount: 50000
};

const qris = new QRIS(config);
const qrString = await qris.generateQR();
```

### Example 2: QR Code Generation with Fee

```typescript
const config: Config = {
    sourceValue: '00020101021226',
    merchantName: 'Store ABC',
    amount: 50000,
    feeCategory: 'PERCENT',
    fee: 2.5
};

const qris = new QRIS(config);
const qrBase64 = await qris.generateQRBase64();
```

### Example 3: QR Code File Generation

```typescript
const config: Config = {
    sourceValue: '00020101021226',
    merchantName: 'Store ABC',
    merchantAddress: '123 Example Street',
    merchantPostalCode: '12345',
    amount: 100000,
    feeCategory: 'FIXED',
    fee: 2000
};

const qris = new QRIS(config);
await qris.generateQRFile('qris-payment.png');
``` 