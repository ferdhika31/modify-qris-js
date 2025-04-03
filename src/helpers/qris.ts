import { CRC16CCITT } from './crc16_ccitt';
import { QRISParseError, ErrorCode } from '../errors';
import { DataEntity, QRISEntity, AcquirerDetailEntity, SwitchingDetailEntity, AdditionalInformationDetailEntity } from '../entities';
import { QRISTags, AcquirerDetailTags, SwitchingDetailTags, CategoryContent, AdditionalInformationTags } from '../enums';

export class QRIS {

	/**
     * Sanitizes a string by removing newlines, carriage returns and trimming whitespace
     * @param input The string to sanitize
     * @returns The sanitized string
     */
    public static sanitize(input: string): string {
        input = input.replace(/\n/g, '');
        input = input.replace(/\r/g, '');
        return input.trim();
    }

	/**
	 * Parse a QRIS code string into structured data
	 * @param codeString The code string to parse
	 * @returns Parsed data object
	 * @throws Error if the code string format is invalid
	 */
	public static parseTag(codeString: string): DataEntity {
		if (codeString.length < 5) {
			throw new QRISParseError(
				'QRIS code is too short. min 5 characters.',
				undefined,
				0,
				codeString
			);
		}

		const tag = codeString.substring(0, 2);
		const lengthCode = codeString.substring(2, 4);
		const length = parseInt(lengthCode, 10);

		if (isNaN(length)) {
			throw new QRISParseError(
				`Format data length is invalid for tag ${tag}`,
				tag,
				2,
				lengthCode
			);
		}

		if (codeString.length < 4 + length) {
			throw new QRISParseError(
				`Data length does not match for tag ${tag}. Required: ${length}, Available: ${codeString.length - 4}`,
				tag,
				4,
				codeString
			);
		}

		const content = codeString.substring(4, 4 + length);

		return {
			tag,
			content,
			data: tag + lengthCode + content,
		};
	}

	public static modifyContent(data: DataEntity, content: string): DataEntity {
        const length = content.length;
        
        // Jika content kosong, return object Data kosong
        if (length === 0) {
            return {
                tag: '',
                content: '',
                data: ''
            };
        }

        // Buat format panjang 2 digit dengan leading zero
        const paddedLength = length.toString().padStart(2, '0');
        
        // Return data baru dengan content yang dimodifikasi
        return {
            tag: data.tag,
            content: content,
            data: data.tag + paddedLength + content
        };
    }

	public static parseAquirerDetail(codeString: string): AcquirerDetailEntity {
		let result: AcquirerDetailEntity = {
			site: null,
			mpan: null,
			terminal_id: null,
			category: null
		};

		while (codeString.length > 0) {
            try {
                const data = this.parseTag(codeString);

				switch (data.tag) {
					case AcquirerDetailTags.SITE:
						result.site = data;
						break;
					case AcquirerDetailTags.MPAN:
						result.mpan = data;
						break;
					case AcquirerDetailTags.TERMINAL_ID:
						result.terminal_id = data;
						break;
					case AcquirerDetailTags.CATEGORY:
						result.category = data;
						break;
					default:
						// Abaikan tag yang tidak dikenal
						break;
				}
				
				codeString = codeString.substring(4 + data.content.length);
			} catch (err) {
                throw new Error(`Failed to parse Aquirer Detail: ${err.message}`);
            }
        }

		return result;
	}

	public static parseSwitchingDetail(codeString: string): SwitchingDetailEntity {
		let result: SwitchingDetailEntity = {
			site: null,
			nmid: null,
			category: null
		};

		while (codeString.length > 0) {
            try {
                const data = this.parseTag(codeString);

				switch (data.tag) {
					case SwitchingDetailTags.SITE:
						result.site = data;
						break;
					case SwitchingDetailTags.NMID:
						result.nmid = data;
						break;
					case SwitchingDetailTags.CATEGORY:
						result.category = data;
						break;
					default:
						// Abaikan tag yang tidak dikenal
						break;
				}
				
				codeString = codeString.substring(4 + data.content.length);
			} catch (err) {
                throw new Error(`Failed to parse Switching Detail: ${err.message}`);
            }
        }

		return result;
	}

	public static parseAdditionalInformationDetail(codeString: string): AdditionalInformationDetailEntity {
		// Definisi tag untuk RFU
		const RFU_TAGS = Array.from(
			{ length: parseInt(AdditionalInformationTags.RFU_END) - parseInt(AdditionalInformationTags.RFU_START) + 1 }, 
			(_, i) => (parseInt(AdditionalInformationTags.RFU_START) + i).toString().padStart(2, '0')
		);

		// Definisi tag untuk Payment System Specific
		const PAYMENT_SYSTEM_TAGS = Array.from(
			{ length: parseInt(AdditionalInformationTags.PAYMENT_SYSTEM_SPECIFIC_END) - parseInt(AdditionalInformationTags.PAYMENT_SYSTEM_SPECIFIC_START) + 1 }, 
			(_, i) => (parseInt(AdditionalInformationTags.PAYMENT_SYSTEM_SPECIFIC_START) + i).toString().padStart(2, '0')
		);

		let result: AdditionalInformationDetailEntity = {
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
		};

		while (codeString.length > 0) {
            try {
                const data = this.parseTag(codeString);

				switch (data.tag) {
					case AdditionalInformationTags.BILL_NUMBER:
						result.bill_number = data;
						break;
					case AdditionalInformationTags.MOBILE_NUMBER:
						result.mobile_number = data;
						break;
					case AdditionalInformationTags.STORE_LABEL:
						result.store_label = data;
						break;
					case AdditionalInformationTags.LOYALTY_NUMBER:
						result.loyalty_number = data;
						break;
					case AdditionalInformationTags.REFERENCE_LABEL:
						result.reference_label = data;
						break;
					case AdditionalInformationTags.CUSTOMER_LABEL:
						result.customer_label = data;
						break;
					case AdditionalInformationTags.TERMINAL_LABEL:
						result.terminal_label = data;
						break;
					case AdditionalInformationTags.PURPOSE_OF_TRANSACTION:
						result.purpose_of_transaction = data;
						break;
					case AdditionalInformationTags.ADDITIONAL_CONSUMER_DATA_REQUEST:
						result.additional_consumer_data_request = data;
						break;
					case AdditionalInformationTags.MERCHANT_TAX_ID:
						result.merchant_tax_id = data;
						break;
					case AdditionalInformationTags.MERCHANT_CHANNEL:
						result.merchant_channel = data;
						break;
					case RFU_TAGS.includes(data.tag) && data.tag:
						result.rfu = data;
						break;
					case PAYMENT_SYSTEM_TAGS.includes(data.tag) && data.tag:
						result.payment_system_specific = data;
						break;
					default:
						// Abaikan tag yang tidak dikenal
						break;
				}
				
				codeString = codeString.substring(4 + data.content.length);
			} catch (err) {
                throw new Error(`Failed to parse Switching Detail: ${err.message}`);
            }
        }

		return result;
	}

	public static parse(qrString: string): QRISEntity {
		// Sanitize string value
		qrString = this.sanitize(qrString);

		let result: QRISEntity = {
			version: null,
			category: null,
			acquirer: null,
			acquirer_bank_transfer: null,
			switching: null,
			merchant_category_code: null,
			currency_code: null,
			payment_amount: null,
			payment_fee_category: null,
			payment_fee: null,
			country_code: null,
			merchant_name: null,
			merchant_city: null,
			merchant_postal_code: null,
			additional_information: null,
			crc_code: null
		};

		while (qrString.length > 0) {
            try {
                const data = this.parseTag(qrString);

                switch (data.tag) {
                    case QRISTags.VERSION: // Version
						result.version = data;
                        break;
                    case QRISTags.CATEGORY: // Category  
						result.category = data;
                        break;
                    case QRISTags.ACQUIRER: // Acquirer
                        try {
                            const detail = this.parseAquirerDetail(data.content);
                            result.acquirer = {
                                tag: data.tag,
                                content: data.content, 
                                data: data.data,
                                detail: detail
                            };
                        } catch (err) {
                            throw new Error(`Invalid parse acquirer for content ${data.content}`);
                        }
                        break;
                    case QRISTags.ACQUIRER_BANK_TRANSFER: // AcquirerBankTransfer
						try {
							const detail = this.parseAquirerDetail(data.content);
							result.acquirer = {
								tag: data.tag,
								content: data.content, 
								data: data.data,
								detail: detail
							};
						} catch (err) {
							throw new Error(`Invalid parse acquirer bank transfer for content ${data.content}`);
						}
						break;
                    case QRISTags.SWITCHING: // Switching
						try {
							const detail = this.parseSwitchingDetail(data.content);
							result.switching = {
								tag: data.tag,
								content: data.content, 
								data: data.data,
								detail: detail
							};
						} catch (err) {
							throw new Error(`Invalid parse switching for content ${data.content}`);
						}
						break;
                    case QRISTags.MERCHANT_CATEGORY_CODE: // MerchantCategoryCode
						result.merchant_category_code = data;
                        break;
                    case QRISTags.CURRENCY_CODE: // CurrencyCode
						result.currency_code = data;
                        break;
                    case QRISTags.PAYMENT_AMOUNT: // PaymentAmount
						result.payment_amount = data;
                        break;
                    case QRISTags.PAYMENT_FEE_CATEGORY: // PaymentFeeCategory
						result.payment_fee_category = data;
                        break;
                    case QRISTags.PAYMENT_FEE_FIXED: // PaymentFeeFixed
						result.payment_fee = data;
						break;
                    case QRISTags.PAYMENT_FEE_PERCENT: // PaymentFeePercent
						result.payment_fee = data;
                        break;
                    case QRISTags.COUNTRY_CODE: // CountryCode
						result.country_code = data;
                        break;
                    case QRISTags.MERCHANT_NAME: // MerchantName
						result.merchant_name = data;
                        break;
                    case QRISTags.MERCHANT_CITY: // MerchantCity
						result.merchant_city = data;
                        break;
                    case QRISTags.MERCHANT_POSTAL_CODE: // MerchantPostalCode
						result.merchant_postal_code = data;
                        break;
                    case QRISTags.ADDITIONAL_INFORMATION: // AdditionalInformation
						try {
							const detail = this.parseAdditionalInformationDetail(data.content);
							result.additional_information = {
								tag: data.tag,
								content: data.content, 
								data: data.data,
								detail: detail
							};
						} catch (err) {
							throw new Error(`Invalid parse switching for content ${data.content}`);
						}
                        break;
                    case QRISTags.CRC_CODE: // CRCCode
						result.crc_code = data;
                        break;
                    default:
                        // Abaikan tag yang tidak dikenal
                        break;
                }

                qrString = qrString.substring(4 + data.content.length);
            } catch (err) {
                if (err instanceof QRISParseError) {
                    console.error('\n🚫 Error Parsing QRIS:');
                    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.error(`❌ ${err.message}`);
                    if (err.tag) console.error(`📌 Tag: ${err.tag}`);
                    if (err.position) console.error(`📍 Posisi: ${err.position}`);
                    if (err.rawData) console.error(`🔍 Data: ${err.rawData}`);
                    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                }
                
                throw new QRISParseError(
                    `Gagal memproses kode QRIS: ${err.message}`,
                    err instanceof QRISParseError ? err.tag : undefined
                );
            }
        }

		return result;
	}

	public static modify(qrisEntity: QRISEntity): QRISEntity {
		let result = null;

		const qrStringConverted: string = 
			(qrisEntity.version?.data ?? '') +
			(qrisEntity.category?.data ?? '') +
			(qrisEntity.acquirer?.data ?? '') +
			(qrisEntity.switching?.data ?? '') +
			(qrisEntity.merchant_category_code?.data ?? '') +
			(qrisEntity.currency_code?.data ?? '') +
			(qrisEntity.payment_amount?.data ?? '') +
			(qrisEntity.payment_fee_category?.data ?? '') +
			(qrisEntity.payment_fee?.data ?? '') +
			(qrisEntity.country_code?.data ?? '') +
			(qrisEntity.merchant_name?.data ?? '') +
			(qrisEntity.merchant_city?.data ?? '') +
			(qrisEntity.merchant_postal_code?.data ?? '') +
			(qrisEntity.additional_information?.data ?? '') +
			(qrisEntity.crc_code?.tag ?? '') + '04';

		const content = CRC16CCITT.generateCode(qrStringConverted);

		qrisEntity.crc_code = this.modifyContent(qrisEntity.crc_code, content);

		return qrisEntity;
	}

	public static isValid(qris: QRISEntity): string[] {
        const errors: string[] = [];

        // Helper function untuk validasi field
        const isValidField = (tag: string | undefined | null, message: string) => {
            if (!tag) {
                errors.push(message);
            }
        };

        // Validasi version dan category
        isValidField(qris.version?.tag, "Version tag is missing");
        isValidField(qris.category?.tag, "Category tag is missing");

        // Validasi category content
        if (qris.category?.content !== CategoryContent.STATIC && 
            qris.category?.content !== CategoryContent.DYNAMIC) {
            errors.push("Category content undefined");
        }

        // Validasi acquirer dan detail-detailnya
        if (!qris.acquirer?.tag) {
            errors.push("Acquirer tag is missing");
        } else {
            isValidField(qris.acquirer.detail?.site?.tag, "Acquirer site tag is missing");
            isValidField(qris.acquirer.detail?.mpan?.tag, "Acquirer MPAN tag is missing");
            isValidField(qris.acquirer.detail?.terminal_id?.tag, "Acquirer terminal id tag is missing");

            if (qris.acquirer.tag === QRISTags.ACQUIRER) {
                isValidField(qris.acquirer.detail?.category?.tag, "Acquirer category tag is missing");

                if (!qris.switching?.tag) {
                    errors.push("Switching tag is missing");
                } else {
                    isValidField(qris.switching.detail?.site?.tag, "Switching site tag is missing");
                    isValidField(qris.switching.detail?.nmid?.tag, "Switching NMID tag is missing");
                    isValidField(qris.switching.detail?.category?.tag, "Switching category tag is missing");
                }
            }
        }

        // Validasi payment fee
        // this.isValidPaymentFee(qris, errors);

        // Validasi field-field wajib lainnya
        isValidField(qris.merchant_category_code?.tag, "Merchant category tag is missing");
        isValidField(qris.currency_code?.tag, "Currency code tag is missing");
        isValidField(qris.country_code?.tag, "Country code tag is missing");
        isValidField(qris.merchant_name?.tag, "Merchant name tag is missing");
        isValidField(qris.merchant_city?.tag, "Merchant city tag is missing");
        isValidField(qris.merchant_postal_code?.tag, "Merchant postal code tag is missing");
        isValidField(qris.crc_code?.tag, "CRC code tag is missing");

        return errors;
    }

    private static isValidPaymentFee(qris: QRISEntity, errors: string[]): void {
        if (!qris?.payment_fee_category?.tag && qris.payment_fee?.tag) {
            errors.push("Payment fee category tag is missing");
        }

        if (qris?.payment_fee_category?.tag && !qris.payment_fee?.tag) {
            errors.push("Payment fee tag is missing");
        }
    }

	public static isValidQRIS(qrisParsed: QRISEntity): boolean {
		const qrStringConverted: string = 
            (qrisParsed.version?.data ?? '') +
            (qrisParsed.category?.data ?? '') +
            (qrisParsed.acquirer?.data ?? '') +
            (qrisParsed.switching?.data ?? '') +
            (qrisParsed.merchant_category_code?.data ?? '') +
            (qrisParsed.currency_code?.data ?? '') +
            (qrisParsed.payment_amount?.data ?? '') +
            (qrisParsed.payment_fee_category?.data ?? '') +
            (qrisParsed.payment_fee?.data ?? '') +
            (qrisParsed.country_code?.data ?? '') +
            (qrisParsed.merchant_name?.data ?? '') +
            (qrisParsed.merchant_city?.data ?? '') +
            (qrisParsed.merchant_postal_code?.data ?? '') +
            (qrisParsed.additional_information?.data ?? '') +
            (qrisParsed.crc_code?.tag ?? '') + '04';

        return qrisParsed.crc_code?.content === CRC16CCITT.generateCode(qrStringConverted);
	}

}