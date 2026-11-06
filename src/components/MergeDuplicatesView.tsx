import React from 'react';
import { ChevronLeft, ShoppingCart, CheckCircle2, Users } from 'lucide-react';
import { IdentitasItem } from '../identitasData';
import { DuplicatePair } from '../types';

interface MergeDuplicatesViewProps {
  pairs: DuplicatePair[];
  totalDuplicateRecordsCount: number;
  onBack: () => void;
  onMergePair: (pair: DuplicatePair) => void;
  onMergeAll: () => void;
  onDismissPair: (pairId: string) => void;
  onEditItem: (item: IdentitasItem) => void;
}

export const MergeDuplicatesView: React.FC<MergeDuplicatesViewProps> = ({
  pairs,
  totalDuplicateRecordsCount,
  onBack,
  onMergePair,
  onMergeAll,
  onDismissPair,
  onEditItem,
}) => {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Back button and page title banner */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Kembali ke Identitas"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#555e69]">
            Merge Duplicates
          </h2>
          <p className="text-xs text-slate-500">
            Ditemukan {pairs.length} pasangan data identitas yang mirip atau identik
          </p>
        </div>
      </div>

      {/* Top Metric Card matching Image 2: "Duplicate 4 buah" + ShoppingCart icon */}
      <div className="inline-flex items-center gap-6 px-6 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="text-xs text-slate-400 font-medium tracking-wide">
            Duplicate
          </div>
          <div className="text-lg font-bold text-slate-800">
            {totalDuplicateRecordsCount} buah
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#05828e] text-white flex items-center justify-center shadow-xs">
          <ShoppingCart className="w-5 h-5" />
        </div>
      </div>

      {/* Main Container Card matching Image 2 */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 sm:p-8">
        {/* Header matching Image 2: "Merge Duplicates (4)" + "Merge All" */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            Merge Duplicates ({pairs.length})
          </h3>

          {pairs.length > 0 && (
            <button
              id="btn-merge-all"
              type="button"
              onClick={onMergeAll}
              className="px-6 py-2.5 bg-[#05828e] hover:bg-[#046c76] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Merge All
            </button>
          )}
        </div>

        {/* List of Duplicate Comparison Pairs matching Image 2 */}
        <div className="divide-y divide-slate-100">
          {pairs.map((pair) => {
            const item1 = pair.item1;
            const item2 = pair.item2;

            return (
              <div key={pair.id} className="py-7 first:pt-6 last:pb-2">
                {/* Side-by-side profiles matching Image 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-6">
                  {/* Left Identity Card */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${item1.avatarBg} text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs`}
                    >
                      {item1.avatarInitial}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-base sm:text-lg text-slate-900 truncate">
                        {item1.codeId} {item1.namaLengkap}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item1.namaPanggilan || '-'}
                      </div>
                      <div className="text-sm text-slate-600 font-mono">
                        {item1.nomorHandPhone || '-'}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {item1.email || '-'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item1.kota || 'Bandung, Jawa Barat'}
                      </div>
                    </div>
                  </div>

                  {/* Right Identity Card */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${item2.avatarBg} text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs`}
                    >
                      {item2.avatarInitial}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-base sm:text-lg text-slate-900 truncate">
                        {item2.codeId} {item2.namaLengkap}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item2.namaPanggilan || '-'}
                      </div>
                      <div className="text-sm text-slate-600 font-mono">
                        {item2.nomorHandPhone || '-'}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {item2.email || '-'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item2.kota || 'Bandung, Jawa Barat'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason badge */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Kemiripan: {pair.reason}</span>
                  </div>

                  {/* Action Buttons matching Image 2: Dismiss, Edit, Merge */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onDismissPair(pair.id)}
                      className="px-6 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditItem(item1)}
                      className="px-6 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onMergePair(pair)}
                      className="px-8 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      Merge
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {pairs.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Semua Data Sudah Rapi
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Tidak ada data identitas yang terdeteksi mirip atau duplikat saat ini.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Kembali ke Tabel Identitas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
