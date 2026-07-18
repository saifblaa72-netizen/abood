import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, MapPin } from 'lucide-react';
import { SOCIAL_LINKS } from '@/constants/social';

const Footer = () => {
  return (
    <footer className="bg-brand-black text-brand-white mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img 
              src="/logo.png" 
              alt="وهيبة فاشن" 
              className="h-20 w-auto object-contain mb-6 bg-white/5 p-3 rounded-lg"
            />
            <p className="text-gray-300 font-cairo leading-relaxed mb-6">
              متجر إلكتروني للملابس النسائية العصرية والأنيقة بأعلى معايير الجودة والأناقة.
            </p>
            <div className="flex gap-4">
              <a 
                href={SOCIAL_LINKS.facebook}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-burgundy-500 flex items-center justify-center hover:bg-burgundy-600 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href={SOCIAL_LINKS.instagram}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-burgundy-500 flex items-center justify-center hover:bg-burgundy-600 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={SOCIAL_LINKS.whatsapp_url}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-tajawal font-semibold mb-6">روابط سريعة</h4>
            <ul className="space-y-3 font-cairo">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  العروض
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-tajawal font-semibold mb-6">خدمة العملاء</h4>
            <ul className="space-y-3 font-cairo">
              <li>
                <Link to="/return-policy" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  سياسة الاستبدال والاسترجاع
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-burgundy-500 transition-colors duration-200">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-tajawal font-semibold mb-6">تواصل معنا</h4>
            <ul className="space-y-4 font-cairo text-gray-300">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-burgundy-500 flex-shrink-0 mt-1" />
                <span>{SOCIAL_LINKS.whatsapp_display}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-burgundy-500 flex-shrink-0 mt-1" />
                <span>الأردن</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 font-cairo text-sm">
            © 2024 وهيبة فاشن. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
