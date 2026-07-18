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
  confirmed: 'مؤكد',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي'
};
