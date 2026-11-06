import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Trash2,
  HelpCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { MutasiItem } from '../types';
import { BANK_ACCOUNTS } from '../mutasiData';

interface ImportMutasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBank: string;
  onImportSuccess: (items: MutasiItem[], mode: 'append' | 'replace', targetBank?: string) => void;
}

interface ParsedRow {
  date: string;
  bankAccount: string;
  keteranganBank: string;
  branch: string | number;
  amount: number;
  type: 'CR' | 'DB';
  balance: number;
  catatan?: string;
  isValid: boolean;
  error?: string;
}

export const ImportMutasiModal: React.FC<ImportMutasiModalProps> = ({
  isOpen,
  onClose,
  defaultBank,
  onImportSuccess,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>(defaultBank);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate Sample CSV Template for user to download
  const handleDownloadTemplate = () => {
    const templateContent =
      '\uFEFFDate,Bank Account,Keterangan Bank,Branch,Amount,Type,Balance,Catatan\n' +
      '1/Nov,BCA 888,TRSF E-BANKING CR DONASI OPERASIONAL DHAMMA,0,500000,CR,83599160,Donasi kas\n' +
      '2/Nov,BCA 888,TRSF E-BANKING CR 0211 PEMESANAN BUKU DKSM,0,95000,CR,83694160,Pesanan buku\n' +
      '3/Nov,BCA 888,BIAYA ADM BULANAN BCA,0,15000,DB,83679160,Biaya admin\n';

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_mutasi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to parse CSV lines taking into account quotes and varying delimiters
  const parseCSVLine = (text: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Detect delimiter: comma, semicolon, or tab
  const detectDelimiter = (line: string): string => {
    const commaCount = (line.match(/,/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    const tabCount = (line.match(/\t/g) || []).length;

    if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    return ',';
  };

  // Helper to parse numbers from various formats (e.g. 95000, 95.000, 95,000.50, Rp 95.000, dsb.)
  const parseAmount = (val: string): number => {
    if (!val) return 0;
    let clean = val.replace(/[^0-9.,-]/g, '').trim();
    if (!clean) return 0;

    // Handle negative sign
    const isNegative = clean.startsWith('-') || clean.endsWith('-');
    clean = clean.replace(/-/g, '');

    // If Indonesian format: 1.000.000,50 or 50.000
    if (clean.includes('.') && clean.includes(',')) {
      if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
        // Dot is thousand, comma is decimal
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        // Comma is thousand, dot is decimal
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      // Could be decimal comma: 95000,50 or thousand comma: 95,000
      const parts = clean.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        clean = clean.replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes('.')) {
      // Could be thousand dot: 95.000 or decimal dot: 95000.50
      const parts = clean.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        clean = clean.replace(/\./g, '');
      }
    }

    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    return isNegative ? -num : num;
  };

  // Parse CSV / TXT File Content
  const processFileContent = (content: string, name: string) => {
    setErrorMessage('');
    const rawLines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    if (rawLines.length === 0) {
      setErrorMessage('File kosong atau tidak memiliki data.');
      return;
    }

    const firstLine = rawLines[0];
    const delimiter = detectDelimiter(firstLine);
    const headerCols = parseCSVLine(firstLine, delimiter).map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Determine column indices
    let dateIdx = -1;
    let bankIdx = -1;
    let ketIdx = -1;
    let branchIdx = -1;
    let amountIdx = -1;
    let typeIdx = -1;
    let balanceIdx = -1;
    let catatanIdx = -1;

    headerCols.forEach((col, idx) => {
      if (col.includes('date') || col.includes('tanggal') || col === 'tgl') dateIdx = idx;
      else if (col.includes('bank') || col.includes('rekening') || col === 'rek') bankIdx = idx;
      else if (col.includes('keterangan') || col.includes('description') || col.includes('uraian') || col.includes('transaksi') || col.includes('ket')) ketIdx = idx;
      else if (col.includes('branch') || col.includes('cabang')) branchIdx = idx;
      else if (col.includes('amount') || col.includes('nominal') || col.includes('jumlah') || col.includes('nilai')) amountIdx = idx;
      else if (col.includes('type') || col.includes('tipe') || col === 'cbcr' || col === 'crdb' || col === 'dk') typeIdx = idx;
      else if (col.includes('balance') || col.includes('saldo')) balanceIdx = idx;
      else if (col.includes('catatan') || col.includes('note') || col.includes('notes')) catatanIdx = idx;
    });

    // Check if first line was a header or direct data
    const isFirstLineHeader = dateIdx !== -1 || amountIdx !== -1 || ketIdx !== -1;
    const dataLines = isFirstLineHeader ? rawLines.slice(1) : rawLines;

    if (dataLines.length === 0) {
      setErrorMessage('Tidak ada baris data transaksi yang ditemukan.');
      return;
    }

    // Default indices if headers not detected
    if (dateIdx === -1) dateIdx = 0;
    if (ketIdx === -1) ketIdx = 1;
    if (amountIdx === -1) amountIdx = 2;
    if (typeIdx === -1 && amountIdx !== -1 && headerCols.length > 3) typeIdx = 3;

    const parsed: ParsedRow[] = [];

    dataLines.forEach((line, lineIndex) => {
      const cols = parseCSVLine(line, delimiter);
      if (cols.length < 2) return; // Skip invalid row

      const rawDate = (cols[dateIdx] || '').trim();
      const rawBank = bankIdx !== -1 ? (cols[bankIdx] || '').trim() : '';
      const rawKet = ketIdx !== -1 ? (cols[ketIdx] || '').trim() : '';
      const rawBranch = branchIdx !== -1 ? (cols[branchIdx] || '').trim() : '0';
      const rawAmountStr = amountIdx !== -1 ? cols[amountIdx] || '' : '';
      const rawTypeStr = typeIdx !== -1 ? (cols[typeIdx] || '').trim().toUpperCase() : '';
      const rawBalanceStr = balanceIdx !== -1 ? cols[balanceIdx] || '' : '0';
      const rawCatatan = catatanIdx !== -1 ? (cols[catatanIdx] || '').trim() : '';

      const parsedAmount = parseAmount(rawAmountStr);
      const parsedBalance = parseAmount(rawBalanceStr);

      // Determine CR / DB
      let finalType: 'CR' | 'DB' = 'CR';
      if (rawTypeStr === 'DB' || rawTypeStr === 'D' || rawTypeStr.includes('DEBET') || rawTypeStr.includes('DEBIT') || rawTypeStr.includes('KELUAR')) {
        finalType = 'DB';
      } else if (rawTypeStr === 'CR' || rawTypeStr === 'C' || rawTypeStr.includes('KREDIT') || rawTypeStr.includes('MASUK')) {
        finalType = 'CR';
      } else if (parsedAmount < 0) {
        finalType = 'DB';
      } else if (rawKet.toUpperCase().includes('TRSF E-BANKING DB') || rawKet.toUpperCase().includes('BIAYA ADM') || rawKet.toUpperCase().includes('PENARIKAN')) {
        finalType = 'DB';
      }

      const isValid = Boolean(rawDate && rawKet && Math.abs(parsedAmount) > 0);
      let error = '';
      if (!rawDate) error = 'Tanggal tidak boleh kosong';
      else if (!rawKet) error = 'Keterangan tidak boleh kosong';
      else if (Math.abs(parsedAmount) <= 0) error = 'Nominal harus lebih dari 0';

      parsed.push({
        date: rawDate,
        bankAccount: rawBank || selectedBank,
        keteranganBank: rawKet,
        branch: rawBranch || '0',
        amount: Math.abs(parsedAmount),
        type: finalType,
        balance: Math.abs(parsedBalance),
        catatan: rawCatatan,
        isValid,
        error,
      });
    });

    if (parsed.length === 0) {
      setErrorMessage('Gagal membaca data dari file. Pastikan format kolom sesuai dengan template.');
      return;
    }

    setFileName(name);
    setParsedRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processFileContent(content, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Terjadi kesalahan saat membaca file.');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processFileContent(content, file.name);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage('Tidak ada data valid yang dapat di-import.');
      return;
    }

    const itemsToImport: MutasiItem[] = validRows.map((r, idx) => ({
      id: `mutasi-import-${Date.now()}-${idx}`,
      bankAccount: selectedBank === 'AUTO' ? (r.bankAccount || defaultBank) : selectedBank,
      date: r.date,
      keteranganBank: r.keteranganBank,
      branch: r.branch,
      amount: r.amount,
      type: r.type,
      balance: r.balance,
      catatan: r.catatan,
    }));

    onImportSuccess(itemsToImport, importMode, selectedBank === 'AUTO' ? undefined : selectedBank);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00899B]/10 text-[#00899B] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Import Data Mutasi Bank</h3>
              <p className="text-xs text-slate-500">Mendukung format file CSV dan TXT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Bank & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Rekening Bank
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B] bg-white text-slate-700"
              >
                {BANK_ACCOUNTS.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.label}
                  </option>
                ))}
                <option value="AUTO">Otomatis dari Kolom Rekening File</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Metode Import
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-[#00899B] focus:ring-[#00899B]"
                  />
                  <span>Tambahkan (Append)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-[#00899B] focus:ring-[#00899B]"
                  />
                  <span>Gantikan (Replace)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#00899B] bg-[#00899B]/5'
                : 'border-slate-200 hover:border-[#00899B]/60 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .txt, text/csv, text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#00899B]/10 text-[#00899B] mx-auto mb-3 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 stroke-[2]" />
            </div>
            {fileName ? (
              <div>
                <p className="text-sm font-bold text-slate-800">{fileName}</p>
                <p className="text-xs text-slate-500 mt-1">Klik untuk mengganti file</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Pilih file CSV / TXT atau seret file ke sini
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Format yang didukung: Date, Keterangan Bank, Branch, Amount, Type (CR/DB), Balance
                </p>
              </div>
            )}
          </div>

          {/* Template Download Option */}
          <div className="flex items-center justify-between text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Belum memiliki format yang sesuai?</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-[#00899B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Contoh Template CSV</span>
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Pratinjau Data ({parsedRows.length} Baris Terbaca)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      {invalidCount} Gagal
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName('');
                  }}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2 px-2.5 w-16">Tanggal</th>
                      <th className="py-2 px-2.5">Keterangan</th>
                      <th className="py-2 px-2.5 text-right w-24">Nominal</th>
                      <th className="py-2 px-2.5 text-center w-14">Tipe</th>
                      <th className="py-2 px-2.5 text-right w-24">Saldo</th>
                      <th className="py-2 px-2.5 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11.5px]">
                    {parsedRows.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50/50' : 'bg-red-50/40 text-red-800'}>
                        <td className="py-2 px-2.5 whitespace-nowrap font-medium text-slate-700">
                          {row.date}
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 truncate max-w-xs" title={row.keteranganBank}>
                          {row.keteranganBank}
                        </td>
                        <td className="py-2 px-2.5 text-right font-medium whitespace-nowrap">
                          {row.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold">
                          <span className={row.type === 'CR' ? 'text-emerald-700' : 'text-rose-700'}>
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-right text-slate-500 whitespace-nowrap">
                          {row.balance > 0 ? row.balance.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          {row.isValid ? (
                            <span className="text-emerald-600 font-semibold text-[10px] inline-flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold text-[10px]" title={row.error}>
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <p className="text-[11px] text-slate-400 text-center">
                  Menampilkan 50 baris pertama dari total {parsedRows.length} data.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={validCount === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              validCount > 0
                ? 'bg-[#00899B] text-white hover:bg-[#007b8c] shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import {validCount > 0 ? `${validCount} Data Mutasi` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
