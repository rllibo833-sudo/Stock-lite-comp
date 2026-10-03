import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { InventoryItem, StockMutation } from '../types/inventory';
import { validateAndParseBackup, RestoreResult } from '../utils/storage';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRestore: (items: InventoryItem[], mutations: StockMutation[]) => void;
  currentItemsCount: number;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({
  isOpen,
  onClose,
  onConfirmRestore,
  currentItemsCount,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<RestoreResult | null>(null);
  const [step, setStep] = useState<'upload' | 'confirm'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);
    setParseResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = validateAndParseBackup(text);
        setParseResult(result);
        if (result.success) {
          setStep('confirm');
        }
      } catch {
        setParseResult({
          success: false,
          errorMessage: 'Gagal membaca berkas. Pastikan file JSON dalam kondisi baik.'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setParseResult({
        success: false,
        errorMessage: 'Gagal membuka file dari perangkat Anda.'
      });
      setIsProcessing(false);
    };

    reader.readAsText(selected);
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleProceed = () => {
    if (parseResult?.success && parseResult.items) {
      onConfirmRestore(parseResult.items, parseResult.mutations || []);
      handleClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Upload className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 id="restore-modal-title" className="text-base font-bold text-slate-900 leading-snug">
                Restore Data Persediaan
              </h2>
              <p className="text-xs text-slate-500">
                Pulihkan data dari berkas backup JSON
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Tutup dialog restore"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {step === 'upload' ? (
            <div>
              <label
                htmlFor="backup-file-input"
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px]"
              >
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700 text-center">
                  Pilih Berkas Backup (.json)
                </span>
                <span className="text-[11px] text-slate-500 text-center mt-1">
                  Format file: STOCKLITE_Backup_YYYY-MM-DD.json
                </span>
                <input
                  id="backup-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Memeriksa dan memvalidasi file backup...</span>
                </div>
              )}

              {parseResult && !parseResult.success && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">File Tidak Valid:</strong>
                    <span>{parseResult.errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Confirmation Step */
            <div className="space-y-3.5">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-sm block">File Backup Valid</strong>
                  <p className="mt-0.5 text-emerald-800">
                    Ditemukan <span className="font-bold">{parseResult?.itemCount} barang</span> dan{' '}
                    <span className="font-bold">{parseResult?.mutations?.length || 0} riwayat mutasi</span>.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    Berkas: {file?.name}
                  </p>
                </div>
              </div>

              {/* Warning about overwriting current data */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Konfirmasi Penggantian Data</strong>
                  <p className="mt-0.5">
                    Data persediaan saat ini ({currentItemsCount} barang) akan digantikan dengan data dari file backup.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          {step === 'confirm' && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg min-h-[40px]"
            >
              Ganti File
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg min-h-[40px]"
          >
            Batal
          </button>
          {step === 'confirm' && (
            <button
              type="button"
              onClick={handleProceed}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm min-h-[40px] flex items-center gap-1.5"
            >
              <span>Lanjutkan Restore</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
