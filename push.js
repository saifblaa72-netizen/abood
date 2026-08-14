import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/** The browser wants the VAPID public key as raw bytes, not base64url text. */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
};

export const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const pushPermission = () => (pushSupported() ? Notification.permission : 'unsupported');

/** iOS only exposes the Push API once the site is installed to the home screen. */
export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const getExistingSubscription = async () => {
  if (!pushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
};

/**
 * Ask for permission, subscribe with the server's VAPID key, and store the
 * subscription in the backend. Returns true when the customer is subscribed.
 */
export const subscribeToPush = async (token = null) => {
  if (!pushSupported()) throw new Error('unsupported');

  // Check the server is set up before spending the customer's one-shot
  // permission prompt on a subscription we could not use anyway.
  const { data } = await axios.get(`${API}/push/public-key`);
  if (!data.enabled || !data.public_key) throw new Error('not_configured');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.public_key)
    });
  }

  await axios.post(`${API}/push/subscribe`, subscription.toJSON(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return true;
};

export const unsubscribeFromPush = async () => {
  const subscription = await getExistingSubscription();
  if (!subscription) return;
  await axios.post(`${API}/push/unsubscribe`, { endpoint: subscription.endpoint }).catch(() => {});
  await subscription.unsubscribe();
};
