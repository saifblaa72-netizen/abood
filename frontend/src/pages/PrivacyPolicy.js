import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Target, Share2, Lock, Cookie, UserCheck, MessageCircle } from 'lucide-react';
import PolicyLayout, { PolicySection, PolicyList } from '@/components/PolicyLayout';
import { SOCIAL_LINKS } from '@/constants/social';

const PrivacyPolicy = () => {
  return (
    <PolicyLayout
      icon={ShieldCheck}
      title="سياسة الخصوصية"
      subtitle="خصوصيتك تهمنا. توضح هذه السياسة البيانات التي نجمعها منك عند استخدام متجر وهيبة فاشن، وكيف نستخدمها ونحميها."
      updatedAt="كانون الثاني 2025"
    >
      <PolicySection icon={Database} title="البيانات التي نجمعها">
        <p>نجمع فقط البيانات اللازمة لإتمام طلبك وتحسين تجربتك:</p>
        <PolicyList
          items={[
            'بيانات الحساب: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، وكلمة المرور (مشفّرة ولا نستطيع الاطلاع عليها).',
            'بيانات التوصيل: المدينة، المنطقة، والعنوان التفصيلي الذي تدخلينه عند إتمام الطلب.',
            'بيانات الطلبات: المنتجات التي طلبتِها، المقاسات والألوان، قيمة الطلب، وحالة الشحن.',
            'نقاط الولاء والإحالة: رصيد نقاطك وكود الإحالة الخاص بك وسجل حركاتها.',
            'محادثات المساعد الذكي: الرسائل التي ترسلينها عبر الشات بوت للرد على استفساراتك.',
          ]}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          لا نطلب ولا نخزّن أي بيانات بطاقات بنكية، لأن الدفع يتم نقداً عند الاستلام.
        </p>
      </PolicySection>

      <PolicySection icon={Target} title="كيف نستخدم بياناتك">
        <PolicyList
          items={[
            'تنفيذ طلباتك وتجهيزها وتوصيلها إلى العنوان الذي حددتِه.',
            'التواصل معك لتأكيد الطلب أو تحديث حالته أو حل أي مشكلة تخصه.',
            'إدارة حسابك ونقاط الولاء وبرنامج الإحالة.',
            'الرد على استفساراتك عبر الواتساب أو المساعد الذكي في الموقع.',
            'تحسين تشكيلة المنتجات وتجربة التصفح في المتجر.',
          ]}
        />
        <p>لا نستخدم بياناتك لأي غرض آخر دون إعلامك.</p>
      </PolicySection>

      <PolicySection icon={Share2} title="مشاركة البيانات مع الغير">
        <p>
          نحن لا نبيع بياناتك ولا نؤجّرها لأي جهة. تتم مشاركة الحد الأدنى من المعلومات فقط في الحالات التالية:
        </p>
        <PolicyList
          items={[
            'مع شركة التوصيل: الاسم ورقم الهاتف والعنوان فقط، لتتمكن من إيصال الطلب.',
            'مع مزوّد خدمة الذكاء الاصطناعي: نص رسالتك في المساعد الذكي فقط، لتوليد الرد.',
            'عند وجود التزام قانوني أو طلب رسمي من جهة مختصة.',
          ]}
        />
      </PolicySection>

      <PolicySection icon={Lock} title="حماية بياناتك">
        <PolicyList
          items={[
            'كلمات المرور محفوظة بصيغة مشفّرة باتجاه واحد (bcrypt) ولا يمكن استرجاعها كنص.',
            'الدخول إلى حسابك يتم عبر رمز مصادقة آمن (JWT).',
            'لوحة التحكم الإدارية محمية ولا يصل إليها إلا الحساب المخوّل.',
            'الاتصال بالموقع مشفّر عبر HTTPS.',
          ]}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          رغم كل ذلك، لا يمكن ضمان أمان مطلق لأي نظام على الإنترنت بنسبة 100%، لذا ننصحك باختيار كلمة مرور قوية وعدم مشاركتها مع أحد.
        </p>
      </PolicySection>

      <PolicySection icon={Cookie} title="الكوكيز والتخزين المحلي">
        <p>
          نستخدم التخزين المحلي في متصفحك (Local Storage) لحفظ جلسة تسجيل الدخول، ومحتويات سلة التسوق، ووضع العرض
          (فاتح/داكن). هذه البيانات تبقى على جهازك ويمكنك حذفها في أي وقت من إعدادات المتصفح، مع العلم أن ذلك سيؤدي إلى
          تسجيل خروجك وإفراغ السلة.
        </p>
      </PolicySection>

      <PolicySection icon={UserCheck} title="حقوقك">
        <PolicyList
          items={[
            'الاطلاع على بياناتك وتعديل معلومات حسابك وعنوانك من صفحة "حسابي".',
            'طلب حذف حسابك وبياناتك الشخصية بالتواصل معنا عبر الواتساب.',
            'طلب نسخة من بيانات طلباتك المحفوظة لدينا.',
            'إيقاف رسائل التسويق في أي وقت.',
          ]}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          بعض بيانات الطلبات قد نحتفظ بها لأغراض محاسبية حتى بعد حذف الحساب.
        </p>
      </PolicySection>

      <PolicySection icon={MessageCircle} title="تواصلي معنا">
        <p>
          لأي استفسار حول خصوصيتك أو لطلب حذف بياناتك، راسلينا على واتساب{' '}
          <a
            href={SOCIAL_LINKS.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-burgundy-500 hover:underline font-semibold"
            dir="ltr"
          >
            {SOCIAL_LINKS.whatsapp_display}
          </a>{' '}
          أو من خلال صفحة{' '}
          <Link to="/contact" className="text-burgundy-500 hover:underline font-semibold">
            تواصل معنا
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyLayout>
  );
};

export default PrivacyPolicy;
