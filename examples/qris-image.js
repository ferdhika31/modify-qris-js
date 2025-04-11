const { QRIS, SourceType, PaymentFeeCategory } = require('../dist');
const path = require('path');

// init
const dynamicQris = new QRIS({
    sourceType: SourceType.IMAGE_PATH,
    sourceValue: path.join(__dirname, 'sample-qris.jpg'),
    merchantAddress: "BANDUNG",
    merchantPostalCode: "40162",
    amount: 10000, // if not set, amount is flexible
    feeCategory: PaymentFeeCategory.PERCENT, // if not set, fee not available (PaymentFeeCategory.PERCENT || PaymentFeeCategory.FIXED)
    fee: 10,
    terminalLabel: 'made by love',
});

// sample output string
dynamicQris.generateQR().then((result) => {
    console.log('result string:', result);
}).catch((error) => {
    console.log(error);
});

// sample output string
dynamicQris.generateQRTerminal().then((result) => {
    console.log(result);
})
.catch((error) => {
    console.log('error qr terminal:', error);
});


// sample output base64
dynamicQris.generateQRBase64().then((result) => {
    console.log('result base64:', result);
})
.catch((error) => {
    console.log('error qr base64:', error);
});

// Generate QR dan simpan ke file
dynamicQris.generateQRFile(path.join(__dirname, 'sample-output-image.png'))
    .then(result => {
        console.log('\n✅ QR berhasil dibuat!');
        console.log('----------------------------------------');
        console.log(`File tersimpan di: ${path.join(__dirname, 'sample-output-image.png')}`);
        console.log('----------------------------------------\n');
    })
    .catch(error => console.error(error, 'membuat QR'));
