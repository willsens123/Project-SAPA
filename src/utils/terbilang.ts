/**
 * Utility to convert numbers into Indonesian formal words ("Terbilang")
 * Example: 2500000 -> "Dua Juta Lima Ratus Ribu Rupiah"
 */
export function angkaKeTerbilang(angka: number | string): string {
  let num: number;
  if (typeof angka === 'string') {
    // Clean currency symbols, commas, and dots
    const cleaned = angka.replace(/[^0-9]/g, '');
    num = parseInt(cleaned, 10);
  } else {
    num = Math.floor(angka);
  }

  if (isNaN(num) || num === 0) return 'Nol Rupiah';

  const satuan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function bilang(n: number): string {
    if (n < 12) {
      return satuan[n];
    } else if (n < 20) {
      return bilang(n - 10) + ' Belas';
    } else if (n < 100) {
      return bilang(Math.floor(n / 10)) + ' Puluh ' + bilang(n % 10);
    } else if (n < 200) {
      return 'Seratus ' + bilang(n - 100);
    } else if (n < 1000) {
      return bilang(Math.floor(n / 100)) + ' Ratus ' + bilang(n % 100);
    } else if (n < 2000) {
      return 'Seribu ' + bilang(n - 1000);
    } else if (n < 1000000) {
      return bilang(Math.floor(n / 1000)) + ' Ribu ' + bilang(n % 1000);
    } else if (n < 1000000000) {
      return bilang(Math.floor(n / 1000000)) + ' Juta ' + bilang(n % 1000000);
    } else if (n < 1000000000000) {
      return bilang(Math.floor(n / 1000000000)) + ' Miliar ' + bilang(n % 1000000000);
    } else if (n < 1000000000000000) {
      return bilang(Math.floor(n / 1000000000000)) + ' Triliun ' + bilang(n % 1000000000000);
    }
    return '';
  }

  const hasil = bilang(num).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
}

/**
 * Format string rupiah e.g. 2500000 -> "Rp 2.500.000"
 */
export function formatRupiah(numOrStr: number | string): string {
  if (typeof numOrStr === 'string' && numOrStr.startsWith('Rp')) {
    return numOrStr;
  }
  const num = typeof numOrStr === 'string' ? parseInt(numOrStr.replace(/[^0-9]/g, ''), 10) : numOrStr;
  if (isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID')}`;
}
