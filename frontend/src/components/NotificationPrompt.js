import { useState, useEffect } from 'react';
import { Bell, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  pushSupported,
  pushPermission,
  getExistingSubscription,
  subscribeToPush,
  isIOS,
  isStandalone
} from '@/lib/push';

const DISMISS_KEY = 'notify_prompt_dismissed';
const DISMISS_DAYS = 14;

const NotificationPrompt = () => {
  const { token } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!pushSupported()) return;
    // Safari on iOS only exposes push to an installed PWA, so asking in the
    // browser tab would just fail. InstallAppPrompt handles that case instead.
    if (isIOS() && !isStandalone()) return;
    if (pushPermission() !== 'default') return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;

    let cancelled = false;
    let timer;

    const tryShow = async () => {
      if (cancelled) return;
      const existing = await getExistingSubscription();
      if (existing || cancelled) return;
      // Never stack on top of the install banner.
      if (document.querySelector('[data-testid="install-app-prompt"]')) {
        timer = setTimeout(tryShow, 5000);
        return;
      }
      setShowPrompt(true);
    };

    timer = setTimeout(tryShow, 15000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleEnable = async () => {
    setSubscribing(true);
    try {
      const subscribed = await subscribeToPush(token);
      if (subscribed) {
        toast.success('تم التفعيل! رح يوصلك إشعار مع كل موديل جديد');
        setShowPrompt(false);
      } else {
        toast.info('ما تم تفعيل الإشعارات. تقدري تفعّليها لاحقاً من إعدادات المتصفح');
        setShowPrompt(false);
      }
    } catch (error) {
      if (error.message === 'not_configured') {
        toast.error('خدمة الإشعارات غير مفعّلة حالياً');
      } else {
        toast.error('تعذّر تفعيل الإشعارات، حاولي مرة ثانية');
      }
      setShowPrompt(false);
    } finally {
      setSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div
      data-testid="notification-prompt"
      className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-burgundy-500 p-4 z-50 animate-fade-up"
    >
      <button
        onClick={handleDismiss}
        aria-label="إغلاق"
        className="absolute top-2 left-2 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-burgundy-500/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-6 h-6 text-burgundy-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-tajawal font-bold text-brand-black dark:text-brand-white mb-1">
            كوني أول من تشوف الجديد
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-cairo mb-3">
            فعّلي الإشعارات ليوصلك تنبيه فوري مع كل موديل جديد ينزل
          </p>
          <Button
            data-testid="enable-notifications-btn"
            onClick={handleEnable}
            disabled={subscribing}
            size="sm"
            className="bg-burgundy-500 hover:bg-burgundy-600 text-white w-full"
          >
            {subscribing ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 ml-2" />
            )}
            فعّلي الإشعارات
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
