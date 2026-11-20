// Generates a valid Brazilian Pix EMV BR Code payload (PIX Copia e Cola / QR Code)
function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitizeAscii(text: string, maxLen: number): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 .,-]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function buildPixEmvPayload(pixKey: string, beneficiary: string, city = 'SAO PAULO'): string {
  const cleanKey = pixKey.trim();
  if (!cleanKey) return '';

  const merchantAccountInfo = formatField(
    '26',
    formatField('00', 'br.gov.bcb.pix') + formatField('01', cleanKey)
  );
  const merchantName = formatField('59', sanitizeAscii(beneficiary || 'O EVANGELHO DA PAZ', 25) || 'O EVANGELHO DA PAZ');
  const merchantCity = formatField('60', sanitizeAscii(city || 'SAO PAULO', 15) || 'SAO PAULO');
  const additionalData = formatField('62', formatField('05', '***'));

  const payloadWithoutCrc =
    formatField('00', '01') +
    merchantAccountInfo +
    formatField('52', '0000') +
    formatField('53', '986') +
    formatField('58', 'BR') +
    merchantName +
    merchantCity +
    additionalData +
    '6304';

  const crc = crc16ccitt(payloadWithoutCrc);
  return payloadWithoutCrc + crc;
}
