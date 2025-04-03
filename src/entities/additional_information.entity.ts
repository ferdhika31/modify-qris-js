import { DataEntity } from './';

export interface AdditionalInformationDetailEntity {
    bill_number: DataEntity | null;
    mobile_number: DataEntity | null;
    store_label: DataEntity | null;
    loyalty_number: DataEntity | null;
    reference_label: DataEntity | null;
    customer_label: DataEntity | null;
    terminal_label: DataEntity | null;
    purpose_of_transaction: DataEntity | null;
    additional_consumer_data_request: DataEntity | null;
    merchant_tax_id: DataEntity | null;
    merchant_channel: DataEntity | null;
    rfu: DataEntity | null;
    payment_system_specific: DataEntity | null;
}

export interface AdditionalInformationEntity {
    tag: string;
    content: string;
    data: string;
    detail: AdditionalInformationDetailEntity;
}

/**
 * Converts a AdditionalInformationDetailEntity to its string representation
 * @param The Additional Information Detail Entity to convert
 * @returns A string representation of the Additional Information Detail data
 */
export function additionalInformationDetailEntityToString(additionalInformationDetail: AdditionalInformationDetailEntity): string {
    let result = '';

    if (additionalInformationDetail.bill_number) {
        result += additionalInformationDetail.bill_number?.data;
    }

    if (additionalInformationDetail.mobile_number) {
        result += additionalInformationDetail.mobile_number?.data;
    }

    if (additionalInformationDetail.store_label) {
        result += additionalInformationDetail.store_label.data;
    }

    if (additionalInformationDetail.loyalty_number) {
        result += additionalInformationDetail.loyalty_number.data;
    }

    if (additionalInformationDetail.reference_label) {
        result += additionalInformationDetail.reference_label.data;
    }

    if (additionalInformationDetail.customer_label) {
        result += additionalInformationDetail.customer_label.data;
    }

    if (additionalInformationDetail.terminal_label) {
        result += additionalInformationDetail.terminal_label.data;
    }

    if (additionalInformationDetail.purpose_of_transaction) {
        result += additionalInformationDetail.purpose_of_transaction.data;
    }

    if (additionalInformationDetail.additional_consumer_data_request) {
        result += additionalInformationDetail.additional_consumer_data_request.data;
    }

    if (additionalInformationDetail.merchant_tax_id) {
        result += additionalInformationDetail.merchant_tax_id.data;
    }

    if (additionalInformationDetail.merchant_channel) {
        result += additionalInformationDetail.merchant_channel.data;
    }

    if (additionalInformationDetail.rfu) {
        result += additionalInformationDetail.rfu.data;
    }

    if (additionalInformationDetail.payment_system_specific) {
        result += additionalInformationDetail.payment_system_specific.data;
    }


    return result;
}