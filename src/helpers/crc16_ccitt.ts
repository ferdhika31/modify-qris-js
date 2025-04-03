/**
 * CRC16CCITT implementation for generating CRC codes
 */
export class CRC16CCITT {
    /**
     * Generate CRC16-CCITT input from input string
     * @param input Input string to generate CRC from
     * @returns Uppercase hexadecimal representation of the CRC
     */
    public static generateCode(input: string): string {
        function charCodeAt(input, i) {
            return input.charCodeAt(i);
        }
    
        let crc = 0xFFFF;
        for (let i = 0; i < input.length; i++) {
            crc ^= charCodeAt(input, i) << 8;
            for (let j = 0; j < 8; j++) {
                crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
            }
        }
    
        let hex = (crc & 0xFFFF).toString(16).toUpperCase();
        return hex.length === 3 ? "0" + hex : hex;    
    }
}