const { QRIS, SourceType, PaymentFeeCategory } = require('../dist');

const qrisCode = '00020101021126740025ID.CO.BANKNEOCOMMERCE.WWW011893600490594025501202120005900565650303UMI51550025ID.CO.BANKNEOCOMMERCE.WWW0215ID10232469816180303UMI5204541153033605802ID5910DHKA STORE6013BANDUNG BARAT6105403916233052230016985445676624117760703T0163042900';

// init
const dynamicQris = new QRIS({
    sourceType: SourceType.CODE,
    sourceValue: qrisCode,
    merchantAddress: "BANDUNG",
    merchantPostalCode: "40162",
    amount: 100, // if not set, amount is flexible
    feeCategory: PaymentFeeCategory.PERCENT, // if not set, fee 
    fee: 0,
    terminalLabel: 'made by love',
});

// sample output string
dynamicQris.generateQR().then((result) => {
    console.log('result string:', result);
})
.catch((error) => {
    console.log(error);
});

// sample output string
dynamicQris.generateQRTerminal().then((result) => {
    console.log(result);
})
.catch((error) => {
    console.log(error);
});


// sample output base64
dynamicQris.generateQRBase64().then((result) => {
    console.log('result base64:', result);
})
.catch((error) => {
    console.log(error);
});

// sample output base64
dynamicQris.generateQRFile('./examples/sample-output.png').then((result) => {
    console.log('result file:', result);
}).catch((error) => {
    console.log(error);
});
