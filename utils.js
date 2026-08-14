import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price) => {
  return `${Number(price ?? 0).toFixed(2)} د.أ`;
};

// Guards every list that comes from the API. When the backend is down or a
// proxy answers with an HTML error page, response.data is a string; calling
// .map on it throws and React unmounts the whole tree, leaving a blank page.
// An empty list degrades to "no products" instead of taking the site down.
export const asArray = (value) => (Array.isArray(value) ? value : []);

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const categories = [
  { value: 'dresses', label: 'فساتين' },
  { value: 'abayas', label: 'عبايات' },
  { value: 'shawls', label: 'إسدالات' },
  { value: 'sets', label: 'أطقم' },
  { value: 'trench', label: 'ترنشكوت' },
  { value: 'cap', label: 'كاب' },
  { value: 'tracksuit', label: 'ترينق' },
  { value: 'accessories', label: 'إكسسوارات' },
];

export const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const orderStatuses = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  processing: 'تم تجهيز الطلب',
  shipped: 'الطلب في الطريق',
  delivered: 'تم التسليم',
  cancelled: 'ملغي'
};

// The steps an order normally walks through, in order. Each one notifies the
// customer, so they get their own one-tap button in the admin card.
export const orderSteps = ['confirmed', 'processing', 'shipped', 'delivered'];
