import React, { useState, useEffect } from 'react';
import { X, History, DownloadCloud, AlertCircle, Loader2 } from 'lucide-react';

interface HistoryModalProps {
    show: boolean;
    onClose: () => void;
    gasUrl: string;
    onRestore: (rowIndex: number) => Promise<void>;
    triggerAlert: (msg: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ show, onClose, gasUrl, onRestore, triggerAlert }) => {
    const [history, setHistory] = useState<{ index: number, time: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoringIndex, setRestoringIndex] = useState<number | null>(null);

    useEffect(() => {
        if (show && gasUrl) {
            fetchHistory();
        }
    }, [show, gasUrl]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(gasUrl, {
                method: 'POST',
                redirect: 'follow',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'history' })
            });
            const data = await response.json();
            if (data && data.status === 'success' && data.history) {
                setHistory(data.history);
            } else {
                triggerAlert("無法取得歷史紀錄");
            }
        } catch (e) {
            console.error(e);
            triggerAlert("取得歷史紀錄失敗");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (rowIndex: number) => {
        setRestoringIndex(rowIndex);
        try {
            await onRestore(rowIndex);
            onClose();
        } catch (e) {
            console.error(e);
            triggerAlert("還原失敗");
        } finally {
            setRestoringIndex(null);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-[#EFEBE0] p-4 flex justify-between items-center border-b border-[#D6CDB5]">
                    <h2 className="text-xl font-extrabold text-[#5E5244] flex items-center gap-2">
                        <History size={24} className="text-[#8CD19D]" />
                        雲端歷史紀錄
                    </h2>
                    <button onClick={onClose} className="text-[#9C9283] hover:text-[#F43F5E] transition-colors"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#FDFBF7]">
                    {!gasUrl ? (
                        <div className="text-center py-8 text-[#9C9283]">
                            <AlertCircle size={48} className="mx-auto mb-4 text-[#F59E0B] opacity-50" />
                            <p>尚未設定雲端連結</p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#8CD19D]">
                            <Loader2 size={40} className="animate-spin mb-4" />
                            <p className="font-bold">載入中...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-[#9C9283]">
                            <History size={48} className="mx-auto mb-4 opacity-20" />
                            <p>沒有歷史紀錄</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-[#9C9283] mb-4">顯示最近 20 筆儲存紀錄，點擊即可還原該時間點的資料。</p>
                            {history.map((item) => (
                                <div key={item.index} className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#8CD19D] transition-colors shadow-sm">
                                    <div>
                                        <p className="font-bold text-[#5E5244]">{new Date(item.time).toLocaleString()}</p>
                                        <p className="text-xs text-[#9C9283]">列數: {item.index}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleRestore(item.index)}
                                        disabled={restoringIndex !== null}
                                        className="px-4 py-2 bg-[#EFEBE0] text-[#796E5B] hover:bg-[#8CD19D] hover:text-white rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {restoringIndex === item.index ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                                        還原
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
