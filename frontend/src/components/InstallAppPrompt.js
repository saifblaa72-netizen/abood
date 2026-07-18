import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallAppPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    if (isStandalone) return;

    const dismissed = localStorage.getItem('install_prompt_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (ios && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('install_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <>
      {!showIOSInstructions && (
        <div 
          data-testid="install-app-prompt"
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-burgundy-500 p-4 z-50 animate-fade-up"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 left-2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex items-start gap-3">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-tajawal font-bold text-brand-black mb-1">
                حمّلي التطبيق!
              </h3>
              <p className="text-sm text-gray-600 font-cairo mb-3">
                تسوقي بسهولة أكبر مع تطبيق وهيبة فاشن على هاتفك
              </p>
              <Button
                data-testid="install-app-btn"
                onClick={handleInstall}
                size="sm"
                className="bg-burgundy-500 hover:bg-burgundy-600 text-white w-full"
              >
                <Download className="w-4 h-4 ml-2" />
                تحميل التطبيق
              </Button>
            </div>
          </div>
        </div>
      )}

      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 left-3 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-4" />
              <h3 className="font-tajawal font-bold text-xl mb-3">تثبيت التطبيق على iPhone</h3>
              <div className="text-start space-y-3 font-cairo text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-burgundy-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</span>
                  <p>اضغطي على زر المشاركة <span className="inline-block bg-gray-100 px-2 rounded">⬆️</span> في متصفح Safari</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-burgundy-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</span>
                  <p>اختاري "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-burgundy-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</span>
                  <p>اضغطي "إضافة" (Add) وسيظهر التطبيق على الشاشة الرئيسية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppPrompt;
