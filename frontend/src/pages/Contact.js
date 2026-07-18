import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { SOCIAL_LINKS } from '@/constants/social';

const Contact = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <h1 className="text-4xl md:text-5xl font-tajawal font-bold text-center mb-12">تواصل معنا</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <a 
            href={SOCIAL_LINKS.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center p-8 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Phone className="w-12 h-12 text-burgundy-500 mx-auto mb-4" />
            <h3 className="font-tajawal font-bold text-xl mb-2">واتس آب</h3>
            <p className="font-cairo text-gray-700" dir="ltr">{SOCIAL_LINKS.whatsapp_display}</p>
          </a>

          <a 
            href="mailto:info@waheebafashion.com"
            className="text-center p-8 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Mail className="w-12 h-12 text-burgundy-500 mx-auto mb-4" />
            <h3 className="font-tajawal font-bold text-xl mb-2">البريد الإلكتروني</h3>
            <p className="font-cairo text-gray-700">info@waheebafashion.com</p>
          </a>

          <div className="text-center p-8 bg-white rounded-lg shadow">
            <MapPin className="w-12 h-12 text-burgundy-500 mx-auto mb-4" />
            <h3 className="font-tajawal font-bold text-xl mb-2">الموقع</h3>
            <p className="font-cairo text-gray-700">الأردن</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-tajawal font-bold mb-6">تابعينا على وسائل التواصل</h2>
          <div className="flex justify-center gap-4">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href={SOCIAL_LINKS.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
              aria-label="WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
