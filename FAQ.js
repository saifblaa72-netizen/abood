import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ShoppingBag, Truck, RefreshCw, Gift, UserCog, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { SOCIAL_LINKS } from '@/constants/social';

const FAQ_GROUPS = [
  {
    icon: ShoppingBag,
    title: 'الطلب والشراء',
    items: [
      {
        q: 'كيف أقوم بالطلب من الموقع؟',
        a: 'اختاري المنتج ثم حددي المقاس واللون وأضيفيه إلى السلة. بعد ذلك افتحي السلة واضغطي «إتمام الطلب»، عبّئي بيانات التوصيل وأكّدي الطلب. سيصلك اتصال أو رسالة واتساب لتأكيد الطلب قبل شحنه.',
      },
      {
        q: 'هل يجب إنشاء حساب لإتمام الطلب؟',
        a: 'نعم، إنشاء الحساب مطلوب لإتمام الطلب حتى تتمكني من متابعة حالة طلباتك وجمع نقاط الولاء. التسجيل يستغرق أقل من دقيقة ويمنحك 50 نقطة ترحيبية.',
      },
      {
        q: 'ماذا لو نفدت الكمية بعد تأكيد الطلب؟',
        a: 'نتواصل معك فوراً لعرض بديل مناسب أو إلغاء المنتج من الطلب دون أي رسوم.',
      },
      {
        q: 'كيف أختار المقاس الصحيح؟',
        a: 'كل منتج تجدين في صفحته المقاسات المتاحة وتفاصيل الخامة. إذا ترددتِ بين مقاسين، راسلينا على الواتساب وسنساعدك في الاختيار حسب قياساتك.',
      },
    ],
  },
  {
    icon: Truck,
    title: 'التوصيل والدفع',
    items: [
      {
        q: 'كم تبلغ رسوم التوصيل؟',
        a: 'رسوم التوصيل ثابتة وقيمتها 3.00 د.أ لجميع مناطق المملكة، وتُضاف إلى إجمالي الطلب عند إتمام الشراء.',
      },
      {
        q: 'ما هي طرق الدفع المتاحة؟',
        a: 'الدفع نقداً عند الاستلام هو الطريقة المعتمدة حالياً. لا نطلب أي بيانات بطاقات بنكية على الموقع.',
      },
      {
        q: 'إلى أي مناطق توصلون؟',
        a: 'نوصل إلى جميع محافظات ومناطق المملكة الأردنية الهاشمية.',
      },
      {
        q: 'ما هي خدمة المعاينة عند التوصيل؟',
        a: 'خيار تفعّلينه عند إتمام الطلب يتيح لك فتح الطلب ومعاينة المنتج أمام المندوب قبل الدفع النهائي، مع إمكانية رفض الاستلام إذا لم يعجبك.',
      },
      {
        q: 'كيف أتابع حالة طلبي؟',
        a: 'من صفحة «حسابي» تجدين قائمة طلباتك وحالة كل طلب: قيد المعالجة، تم الشحن، أو تم التوصيل.',
      },
    ],
  },
  {
    icon: RefreshCw,
    title: 'الاستبدال والاسترجاع',
    items: [
      {
        q: 'هل يمكنني استبدال المنتج إذا لم يناسبني المقاس؟',
        a: 'نعم، خلال 3 أيام من الاستلام وبشرط أن يكون المنتج غير مستعمل وبتاغاته الأصلية. تُطبّق رسوم توصيل 3.00 د.أ على الشحنة البديلة إذا كان الاستبدال بسبب تغيير الرأي أو المقاس.',
      },
      {
        q: 'ماذا لو وصلني منتج خاطئ أو به عيب؟',
        a: 'راسلينا فوراً على الواتساب مع صور واضحة للمنتج. في هذه الحالة نتحمّل نحن كامل رسوم الاستبدال ولا تدفعين أي مبلغ إضافي.',
      },
      {
        q: 'هل هناك منتجات لا تقبل الإرجاع؟',
        a: 'نعم: الملابس الداخلية والجوارب والإكسسوارات لأسباب صحية، بالإضافة إلى منتجات التصفية النهائية والقطع المفصّلة حسب الطلب.',
      },
      {
        q: 'متى أستلم قيمة الاسترجاع؟',
        a: 'خلال مدة أقصاها 7 أيام عمل من فحص المنتج المُعاد، نقداً عبر المندوب أو بحوالة على الاسم المسجّل في الطلب.',
      },
    ],
  },
  {
    icon: Gift,
    title: 'نقاط الولاء والإحالة',
    items: [
      {
        q: 'كيف أجمع نقاط الولاء؟',
        a: 'تحصلين على نقطة واحدة مقابل كل 10 د.أ من قيمة طلبك المكتمل، إضافة إلى 50 نقطة ترحيبية عند إنشاء حسابك.',
      },
      {
        q: 'كيف أستخدم نقاطي وكم تساوي؟',
        a: 'عند وصول رصيدك إلى 200 نقطة تحصلين على خصم 10.00 د.أ. الاستبدال يتم بشرائح كاملة: 200 نقطة = 10 د.أ، 400 نقطة = 20 د.أ، وهكذا. تختارين الخصم بضغطة واحدة في صفحة إتمام الطلب، ويمكنك متابعة تقدّمك نحو الخصم التالي من صفحة «حسابي».',
      },
      {
        q: 'ليش ما بقدر أستخدم نقاطي؟',
        a: 'إما أن رصيدك أقل من 200 نقطة، أو أن قيمة طلبك أقل من قيمة الخصم — الخصم لا يتجاوز قيمة المنتجات، ورسوم التوصيل تبقى مستحقة.',
      },
      {
        q: 'كيف يعمل كود الإحالة؟',
        a: 'لكل حساب كود إحالة خاص تجدينه في صفحة «حسابي». عند تسجيل صديقة باستخدام كودك تحصلين على 100 نقطة وتحصل هي على 50 نقطة إضافية.',
      },
      {
        q: 'هل تنتهي صلاحية النقاط؟',
        a: 'النقاط تبقى في رصيدك ولا تنتهي، لكن تُسحب النقاط الممنوحة عن أي طلب يتم إلغاؤه أو إرجاعه.',
      },
    ],
  },
  {
    icon: UserCog,
    title: 'الحساب والخصوصية',
    items: [
      {
        q: 'كيف أعدّل عنواني أو بياناتي؟',
        a: 'من صفحة «حسابي» يمكنك تعديل الاسم ورقم الهاتف وعنوان التوصيل في أي وقت.',
      },
      {
        q: 'هل بياناتي في أمان؟',
        a: 'نعم. كلمة المرور محفوظة بصيغة مشفّرة ولا يمكن لأحد الاطلاع عليها، ولا نشارك بياناتك مع أي جهة عدا شركة التوصيل لإيصال طلبك. التفاصيل الكاملة في صفحة سياسة الخصوصية.',
      },
      {
        q: 'كيف أحذف حسابي؟',
        a: 'راسلينا على الواتساب بطلب حذف الحساب وسنقوم بذلك، مع الاحتفاظ ببيانات الطلبات السابقة لأغراض محاسبية فقط.',
      },
    ],
  },
];

const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[900px]">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-burgundy-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <HelpCircle className="w-8 h-8 text-burgundy-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-tajawal font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="font-cairo text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            جمعنا لك أكثر الأسئلة التي تصلنا من عميلاتنا وإجاباتها. إذا لم تجدي إجابة سؤالك، نحن على بُعد رسالة واتساب.
          </p>
        </div>

        <div className="space-y-6">
          {FAQ_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <section
                key={group.title}
                className="bg-white dark:bg-gray-900/40 rounded-lg shadow-sm border border-gray-100 dark:border-white/10 p-6 md:p-8"
              >
                <h2 className="flex items-center gap-3 text-xl md:text-2xl font-tajawal font-bold mb-2">
                  <Icon className="w-6 h-6 text-burgundy-500 flex-shrink-0" />
                  {group.title}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {group.items.map((item, index) => (
                    <AccordionItem
                      key={item.q}
                      value={`${group.title}-${index}`}
                      className="border-gray-100 dark:border-white/10 last:border-b-0"
                    >
                      <AccordionTrigger className="font-cairo font-semibold text-base text-right hover:no-underline hover:text-burgundy-500 gap-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="font-cairo text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>

        <div className="mt-10 bg-burgundy-500/5 border border-burgundy-500/20 rounded-lg p-8 text-center">
          <MessageCircle className="w-10 h-10 text-burgundy-500 mx-auto mb-4" />
          <h2 className="text-2xl font-tajawal font-bold mb-3">لم تجدي إجابة سؤالك؟</h2>
          <p className="font-cairo text-gray-600 dark:text-gray-400 mb-6">
            فريق خدمة العملاء جاهز لمساعدتك في أي وقت.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={SOCIAL_LINKS.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-cairo font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              راسلينا على واتساب
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-burgundy-500 hover:bg-burgundy-600 text-white font-cairo font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              صفحة التواصل
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
