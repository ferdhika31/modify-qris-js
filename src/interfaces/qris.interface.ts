/**
 * Interface representing QRIS tag values
 */
export interface QRISTags {
    version: string;
    category: string;
    acquirer: string;
    acquirerBankTransfer: string;
    switching: string;
    merchantCategoryCode: string;
    currencyCode: string;
    paymentAmount: string;
    paymentFeeCategory: string;
    paymentFeeFixed: string;
    paymentFeePercent: string;
    countryCode: string;
    merchantName: string;
    merchantCity: string;
    merchantPostalCode: string;
    additionalInformation: string;
    crcCode: string;
}

/**
 * Interface representing QRIS category contents
 */
export interface QRISCategoryContents {
    static: string;
    dynamic: string;
}

/**
 * Interface representing QRIS payment fee category contents
 */
export interface QRISPaymentFeeCategoryContents {
    fixed: string;
    percent: string;
}
