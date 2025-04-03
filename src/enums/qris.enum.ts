// Define qris tags
export const QRISTags = {
    VERSION: '00',
    CATEGORY: '01',
    ACQUIRER: '26',
    ACQUIRER_BANK_TRANSFER: '26',
    SWITCHING: '51',
    MERCHANT_CATEGORY_CODE: '52',
    CURRENCY_CODE: '53',
    PAYMENT_AMOUNT: '54',
    PAYMENT_FEE_CATEGORY: '55',
    PAYMENT_FEE_FIXED: '56',
    PAYMENT_FEE_PERCENT: '57',
    COUNTRY_CODE: '58',
    MERCHANT_NAME: '59',
    MERCHANT_CITY: '60',
    MERCHANT_POSTAL_CODE: '61',
    ADDITIONAL_INFORMATION: '62',
    CRC_CODE: '63'
};

export const SourceType = {
    IMAGE_PATH: 'image_path',
    CODE: 'code',
    BASE64: 'base64'
}
                    
export const PaymentFeeCategory = {
    FIXED: 'FIXED',
    PERCENT: 'PERCENT',
};

export const PaymentFeeCategoryContent = {
    FIXED: '02',
    PERCENT: '03',
}