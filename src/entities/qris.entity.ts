import { DataEntity, AdditionalInformationEntity, AcquirerEntity, SwitchingEntity } from './';

export interface QRISEntity {
    version: DataEntity | null;
    category: DataEntity | null;
    acquirer: AcquirerEntity | null;
    acquirer_bank_transfer: AcquirerEntity | null;
    switching: SwitchingEntity | null;
    merchant_category_code: DataEntity | null;
    currency_code: DataEntity | null;
    payment_amount: DataEntity | null;
    payment_fee_category: DataEntity | null;
    payment_fee: DataEntity | null;
    country_code: DataEntity | null;
    merchant_name: DataEntity | null;
    merchant_city: DataEntity | null;
    merchant_postal_code: DataEntity | null;
    additional_information: AdditionalInformationEntity | null;
    crc_code: DataEntity | null;
}

/**
 * Converts a QRISEntity to its string representation
 * @param qris The QRIS entity to convert
 * @returns A string representation of the QRIS data
 */
export function qrisEntityToString(qris: QRISEntity): string {
    let result = qris.version?.data + qris.category?.data;

    if (qris.acquirer) {
        result += qris.acquirer.data;
    }

    if (qris.switching) {
        result += qris.switching.data;
    }

    if (qris.merchant_category_code) {
        result += qris.merchant_category_code.data;
    }

    if (qris.currency_code) {
        result += qris.currency_code.data;
    }

    if (qris.payment_amount) {
        result += qris.payment_amount.data;
    }

    if (qris.payment_fee_category) {
        result += qris.payment_fee_category.data;
    }

    if (qris.payment_fee) {
        result += qris.payment_fee.data;
    }

    if (qris.country_code) {
        result += qris.country_code.data;
    }

    if (qris.merchant_name) {
        result += qris.merchant_name.data;
    }

    if (qris.merchant_city) {
        result += qris.merchant_city.data;
    }

    if (qris.merchant_postal_code) {
        result += qris.merchant_postal_code.data;
    }

    if (qris.additional_information) {
        result += qris.additional_information.data;
    }

    result += qris.crc_code?.data;

    return result;
}