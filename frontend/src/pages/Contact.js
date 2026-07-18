import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <h1 className="text-4xl md:text-5xl font-tajawal font-bold text-center mb-12">تواصل معنا</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <Phone className="w-12 h-12 text-burgundy-500 mx-auto mb-4" />
            <h3 className="font-tajawal font-bold text-xl mb-2">الهاتف</h3>
            <p className="font-cairo text-gray-700">+966 50 123 4567</p>
          </div>

          <div className="text-center p-8 bg-white rounded-lg shadow">
            <Mail className="w-12 h-12 text-burgundy-500 mx-auto mb-4" />
            <h3 className="font-tajawal font-bold text-xl mb-2">البريد الإلكتروني</h3>
            <p className="font-cairo text-gray-700">info@waheebafashion.com</p>
          </div>

          <div className="text-center p-8 bg-white rounded-lg shadow">
            <MapPin className="w-12 h-12 text-burgundy-500 mx-auto mb-4" />
            <h3 className="font-tajawal font-bold text-xl mb-2">الموقع</h3>
            <p className="font-cairo text-gray-700">المملكة العربية السعودية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
