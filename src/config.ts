export interface Config {
    sourceType?: string;
    sourceValue?: string;
    merchantName?: string | null;
    merchantAddress?: string | null;
    merchantPostalCode?: string | null;
    amount?: number | null | undefined;
    feeCategory?: string | null;
    fee?: number | null | undefined;
    terminalLabel?: string | null;
}