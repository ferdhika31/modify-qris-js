const path = require('path');
import { toDataURL, toString, toFile } from 'qrcode';
import { Config } from './config';
import { QRISTags, SourceType, PaymentFeeCategoryContent, PaymentFeeCategory, CategoryContent, AdditionalInformationTags } from './enums';
import { QRIS as QRISHelper } from './helpers/qris';
import { QRISReader } from './helpers/reader';
import { CRC16CCITT } from './helpers/crc16_ccitt';
import { QRISEntity, qrisEntityToString, additionalInformationDetailEntityToString } from './entities';
import { QRISError, ErrorCode } from './errors';

export class QRIS {
    
    protected sourceType: string;
    protected sourceValue: string;
    protected merchantName: string;
    protected merchantAddress: string;
    protected merchantPostalCode: string;
    protected amount: number | 0;
    protected feeCategory: string;
    protected fee: number | 0;
    protected terminalLabel: string;
    protected parsedString: string;
    protected resultString: string;

    constructor(config: Config) {
        // init default
        this.sourceType = SourceType.CODE;

        if (config.sourceType) {
            this.sourceType = config.sourceType;
        }

        if (config.sourceValue) {
            this.sourceValue = config.sourceValue;
        }

        if (config.merchantName) {
            this.setMerchantName(config.merchantName);
        }

        if (config.merchantAddress) {
            this.setMerchantAddress(config.merchantAddress);
        }

        if (config.merchantPostalCode) {
            this.setMerchantPostalCode(config.merchantPostalCode);
        }

        if (config.amount) {
            this.setAmount(config.amount);
        }

        if (config.feeCategory) {
            this.setFeeCategory(config.feeCategory);
        }

        if (config.fee) {
            this.setFee(config.fee);
        }
	}

    public setMerchantName(merchantName: string): void {
        this.merchantName = merchantName;
    }

    public setMerchantAddress(merchantAddress: string): void {
        this.merchantAddress = merchantAddress;
    }

    public setMerchantPostalCode(merchantPostalCode: string): void {
        this.merchantPostalCode = merchantPostalCode;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }

    public setFeeCategory(feeCategory: string): void {
        this.feeCategory = feeCategory;
    }

    public setFee(fee: number): void {
        this.fee = fee;
    }

    public setTerminalLabelCategory(terminalLabel: string): void {
        this.terminalLabel = terminalLabel;
    }

    private sourceValueIsEmpty(): boolean {
        if ([undefined, ''].includes(this.sourceValue)) {
            return true;
        }
        return false;
    }

    private generate(sourceValue: string | null | undefined): string {
        // check value qr code is not empty
        if (this.sourceValueIsEmpty()) {
            throw new QRISError(
                'Source value is empty.',
                ErrorCode.SOURCE_EMPTY,
                { source_type: this.sourceType, source_value: this.sourceValue }
            )
        }

        if (!sourceValue) {
            sourceValue = this.sourceValue;
        }

        // parse to object qris
        let parsedString = QRISHelper.parse(sourceValue);

        // set qris value
        if (this.amount) {
            const amount = this.amount.toString();
            const paddedLength = amount.toString().padStart(2, '0');
            parsedString.payment_amount = QRISHelper.modifyContent({
                tag: QRISTags.PAYMENT_AMOUNT,
                content: amount,
                data: QRISTags.PAYMENT_AMOUNT + paddedLength + amount
            }, amount);
        } else {
            parsedString.payment_amount = null;
        }

        if (parsedString.acquirer.tag == QRISTags.ACQUIRER) {
            if (this.merchantName) {
                parsedString.merchant_name = QRISHelper.modifyContent(parsedString.merchant_name, this.merchantName);
            }
            if (this.merchantAddress) {
                parsedString.merchant_city = QRISHelper.modifyContent(parsedString.merchant_city, this.merchantAddress);
            }
            if (this.merchantPostalCode) {
                parsedString.merchant_postal_code = QRISHelper.modifyContent(parsedString.merchant_postal_code, this.merchantPostalCode);
            }
            if (this.amount > 0 && this.feeCategory != '' && this.fee > 0) {
                const categoryContent = CategoryContent.DYNAMIC;
                const categoryContentLength = categoryContent.toString().padStart(2, '0');
                parsedString.category = QRISHelper.modifyContent({
                    tag: QRISTags.CATEGORY,
                    content: categoryContent,
                    data: QRISTags.CATEGORY + categoryContentLength + categoryContent
                }, categoryContent);

                if (this.feeCategory == PaymentFeeCategory.PERCENT && this.fee > 100) {
                    throw new QRISError(
                        'fee may not exceed 100%',
                        ErrorCode.FEE_EXCEEDED,
                        { maxFee: 100, actualFee: this.fee }
                    )
                }

                let paymentFeeCategoryTag = QRISTags.PAYMENT_FEE_CATEGORY;
                let paymentFeeCategoryContentLength = '';
                let paymentFeeCategoryContent = '';
                let paymentFeeTag = '';
                if (this.feeCategory == PaymentFeeCategory.FIXED) {
                    paymentFeeCategoryContent = PaymentFeeCategoryContent.FIXED;
                    paymentFeeTag = QRISTags.PAYMENT_FEE_FIXED;
                } else if (this.feeCategory == PaymentFeeCategory.PERCENT) {
                    paymentFeeCategoryContent = PaymentFeeCategoryContent.PERCENT;
                    paymentFeeTag = QRISTags.PAYMENT_FEE_PERCENT;
                }

                paymentFeeCategoryContentLength = paymentFeeCategoryContent.toString().padStart(2, '0');
                parsedString.payment_fee_category = QRISHelper.modifyContent({
                    tag: paymentFeeCategoryTag,
                    content: paymentFeeCategoryContent,
                    data: paymentFeeCategoryTag + paymentFeeCategoryContentLength + paymentFeeCategoryContent
                }, paymentFeeCategoryContent);

                if (parsedString.payment_fee_category.tag != "") {
                    const paymentFee = this.fee.toString();
                    const paddedLengthFee = paymentFee.toString().padStart(2, '0');
                    parsedString.payment_fee = QRISHelper.modifyContent({
                        tag: paymentFeeTag,
                        content: paymentFee,
                        data: paymentFeeTag + paddedLengthFee + paymentFee
                    }, paymentFee);
                }
            }
        }

        if (this.terminalLabel) {
            const terminalLabelContent = this.terminalLabel;
            const terminalLabelContentLength = terminalLabelContent.toString().padStart(2, '0');
            parsedString.additional_information.detail.terminal_label = QRISHelper.modifyContent({
                tag: AdditionalInformationTags.TERMINAL_LABEL,
                content: terminalLabelContent,
                data: AdditionalInformationTags.TERMINAL_LABEL + terminalLabelContentLength + terminalLabelContent
            }, terminalLabelContent);
        }
        
        // refresh data additional information
        const additionalInformationContent = additionalInformationDetailEntityToString(parsedString.additional_information.detail);
        const additionalInformationContentLength = additionalInformationContent.length.toString().padStart(2, '0');
        parsedString.additional_information = {
            tag: QRISTags.ADDITIONAL_INFORMATION,
            content: additionalInformationContent,
            data: QRISTags.ADDITIONAL_INFORMATION + additionalInformationContentLength + additionalInformationContent,
            detail: parsedString.additional_information.detail,
        };

        // modify qris
        const modifyQrisParse = QRISHelper.modify(parsedString);

        // validation qris
        const isValidQrisErr = QRISHelper.isValid(modifyQrisParse);
        if (isValidQrisErr.length > 0) {
            throw new QRISError(
                'Validation failed.',
                ErrorCode.VALIDATION_FAILED,
                isValidQrisErr
            )
        }

        return qrisEntityToString(modifyQrisParse);
    }

    private async readQR(): Promise<string> {
        if (this.sourceType == SourceType.IMAGE_PATH) {
            const content = await QRISReader.readFromFile(this.sourceValue);
            return this.generate(content);
        } else {
            return this.generate(null);
        }
    }

    public async generateQR(): Promise<string> {
        try {
            return await this.readQR();
        } catch (err) {
            throw new Error(err);
        }
    }

    public async generateQRBase64(): Promise<string> {
        try {
            const resultString = await this.readQR();
        
            return toDataURL(resultString).then(url => {
                return url;
            }).catch(err => {
                throw new Error(err);
            })
        } catch (err) {
            return err;
        }
    }

    public async generateQRTerminal(): Promise<string> {
        try {
            const resultString = await this.readQR();
        
            return toString(resultString, { type: 'terminal', small: true }).then(url => {
                return url;
            }).catch(err => {
                throw new Error(err);
            })
        } catch (err) {
            return err;
        }
    }

    public async generateQRFile(output: string): Promise<string> {
        try {
            if (!output) {
                output = 'output.png';
            }
            const resultString = await this.readQR();
    
            return toFile(output, resultString).then(() => {
                return output;
            }).catch(err => {
                throw new Error(err);
            })
        } catch (err) {
            throw new Error(err);
        }
    }
}