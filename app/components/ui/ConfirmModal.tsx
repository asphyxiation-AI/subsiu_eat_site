import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setOptions(options);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel]);

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <ConfirmContext.Provider value={{ confirm }}>
        {children}
      </ConfirmContext.Provider>
    );
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && options && (
        <>
          {/* Оверлей */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] animate-fadeIn"
            onClick={handleCancel}
          />
          
          {/* Диалог */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md animate-scaleIn">
            <div className="bg-white rounded-2xl shadow-2xl mx-4 overflow-hidden">
              {/* Заголовок */}
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{options.title}</h3>
                    {options.message && (
                      <p className="text-gray-600 mt-2">{options.message}</p>
                    )}
                  </div>
                  <button 
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Кнопки */}
              <div className="p-6 pt-5 flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  {options.cancelText || 'Отмена'}
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-[#0066CC] to-[#0099FF] hover:from-[#0052A3] hover:to-[#0080FF] text-white transition-all shadow-lg hover:shadow-xl"
                >
                  {options.confirmText || 'Подтвердить'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }
      `}</style>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}