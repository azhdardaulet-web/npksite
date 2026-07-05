import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useImportExcel, useConfirmImport, PurchaseItemInput } from '@/hooks/usePurchases';

interface Props {
  onClose: () => void;
}

export default function ExcelImportModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [validItems, setValidItems] = useState<PurchaseItemInput[]>([]);
  const [errors, setErrors] = useState<{ row: number; error: string }[]>([]);

  const importExcel = useImportExcel();
  const confirmImport = useConfirmImport();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        importExcel.mutate(file, {
          onSuccess: (data) => {
            setValidItems(data.valid);
            setErrors(data.errors);
            setStep(2);
          },
        });
      }
    },
    [importExcel]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleConfirm = () => {
    confirmImport.mutate(validItems, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Импорт плана закупок</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {importExcel.isPending ? (
                <p className="text-sm font-medium text-gray-600">Анализ файла...</p>
              ) : (
                <>
                  <p className="text-base font-medium text-gray-900 mb-1">
                    Перетащите файл сюда или нажмите для выбора
                  </p>
                  <p className="text-sm text-gray-500">Поддерживаются файлы Excel (.xlsx, .xls)</p>
                </>
              )}
              {importExcel.isError && (
                <p className="text-sm font-medium text-red-600 mt-4">
                  Ошибка при загрузке файла. Попробуйте еще раз.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-medium text-green-900">Успешно распознано</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{validItems.length}</p>
                    <p className="text-xs text-green-600 mt-1">записей готовы к импорту</p>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-600 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-medium text-red-900">Ошибки</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">{errors.length}</p>
                    <p className="text-xs text-red-600 mt-1">строк с ошибками</p>
                  </div>
                </div>
              </div>

              {errors.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                    <h3 className="text-sm font-medium text-red-800">Детали ошибок</h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-white p-4">
                    <ul className="space-y-2 text-sm">
                      {errors.map((err, i) => (
                        <li key={i} className="flex gap-2 text-gray-700">
                          <span className="font-medium text-gray-900 min-w-16">Строка {err.row}:</span>
                          <span className="text-red-600">{err.error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {validItems.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-800">Предпросмотр корректных данных</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 font-medium text-gray-500">№</th>
                          <th className="px-3 py-2 font-medium text-gray-500">Год</th>
                          <th className="px-3 py-2 font-medium text-gray-500">Наименование</th>
                          <th className="px-3 py-2 font-medium text-gray-500">Способ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {validItems.slice(0, 100).map((item, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-gray-500">{item.number}</td>
                            <td className="px-3 py-2 text-gray-900 font-medium">{item.year}</td>
                            <td className="px-3 py-2 text-gray-900 line-clamp-1" title={item.name}>
                              {item.name}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{item.procurementType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validItems.length > 100 && (
                      <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                        Показаны первые 100 записей
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {step === 2 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={confirmImport.isPending}
            >
              Загрузить другой файл
            </button>
            <button
              onClick={handleConfirm}
              disabled={validItems.length === 0 || confirmImport.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {confirmImport.isPending ? 'Загрузка...' : `Импортировать ${validItems.length} записей`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
