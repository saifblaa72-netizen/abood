import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price) => {
  return `${price.toFixed(2)} د.أ`;
};

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
