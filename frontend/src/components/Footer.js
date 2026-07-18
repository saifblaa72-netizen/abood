import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-black text-brand-white mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-tajawal font-bold text-burgundy-500 mb-6">
              وهيبة فاشن
            </h3>
            <p className="text-gray-300 font-cairo leading-relaxed mb-6">
              متجر إلكتروني للملابس النسائية العصرية والأنيقة بأعلى معايير الجودة والأناقة.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-burgundy-500 flex items-center justify-center hover:bg-burgundy-600 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-burgundy-500 flex items-center justify-center hover:bg-burgundy-600 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
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
                <span>+966 50 123 4567</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-burgundy-500 flex-shrink-0 mt-1" />
                <span>info@waheebafashion.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-burgundy-500 flex-shrink-0 mt-1" />
                <span>المملكة العربية السعودية</span>
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
