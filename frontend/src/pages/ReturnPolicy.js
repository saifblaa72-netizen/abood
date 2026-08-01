import { RefreshCw, CheckCircle2, XCircle, ListOrdered, Eye, Truck, MessageCircle } from 'lucide-react';
import PolicyLayout, { PolicySection, PolicyList } from '@/components/PolicyLayout';
import { SOCIAL_LINKS } from '@/constants/social';

const ReturnPolicy = () => {
  return (
    <PolicyLayout
      icon={RefreshCw}
      title="سياسة الاستبدال والاسترجاع"
      subtitle="راحتك أهم من البيع. إذا لم يعجبك المنتج أو لم يناسبك المقاس، نوضح لك هنا خطوات الاستبدال والاسترجاع بكل بساطة."
      updatedAt="كانون الثاني 2025"
    >
      <PolicySection icon={Eye} title="خدمة المعاينة عند التوصيل">
        <p>
          أسهل طريقة لتجنّب أي مشكلة: فعّلي خيار <strong>«أرغب بخدمة المعاينة عند التوصيل»</strong> عند إتمام الطلب.
          سيتيح لك المندوب فتح الطلب ومعاينة المنتج قبل الدفع النهائي، ويمكنك رفض استلامه في حينها إن لم يعجبك.
        </p>
      </PolicySection>

      <PolicySection icon={CheckCircle2} title="شروط قبول الاستبدال أو الاسترجاع">
        <PolicyList
          items={[
            'تقديم الطلب خلال 3 أيام من تاريخ استلام الشحنة.',
            'أن يكون المنتج بحالته الأصلية: غير مستعمل وغير مغسول وخالٍ من أي روائح أو آثار مكياج.',
            'وجود جميع البطاقات (التاغات) والتغليف الأصلي كما هي دون نزع.',
            'إرفاق رقم الطلب أو فاتورة الشراء.',
          ]}
        />
      </PolicySection>

      <PolicySection icon={XCircle} title="منتجات لا تقبل الاستبدال أو الاسترجاع">
        <PolicyList
          items={[
            'الملابس الداخلية والجوارب، لأسباب صحية.',
            'الإكسسوارات والأقراط، لأسباب صحية.',
            'المنتجات المخفّضة ضمن عروض التصفية النهائية (Final Sale).',
            'المنتجات المفصّلة أو المعدّلة بناءً على طلبك.',
            'المنتجات التي تعرضت للتلف أو الاستعمال بعد الاستلام.',
          ]}
        />
      </PolicySection>

      <PolicySection icon={ListOrdered} title="خطوات تقديم الطلب">
        <ol className="space-y-4">
          {[
            'تواصلي معنا عبر الواتساب خلال 3 أيام من الاستلام وأرسلي رقم الطلب وسبب الاستبدال أو الاسترجاع.',
            'أرسلي صوراً واضحة للمنتج والتاغات، خاصة إذا كان هناك عيب مصنعي.',
            'بعد موافقة فريق خدمة العملاء، نحدد معك موعد استلام القطعة من عنوانك.',
            'نفحص المنتج عند وصوله، ثم نرسل البديل أو نعيد لك المبلغ خلال مدة أقصاها 7 أيام عمل.',
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-burgundy-500 text-white font-tajawal font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </PolicySection>

      <PolicySection icon={Truck} title="من يتحمّل رسوم التوصيل؟">
        <PolicyList
          items={[
            'إذا كان الخطأ منّا (منتج خاطئ، مقاس مختلف عن الطلب، أو عيب مصنعي): نتحمّل نحن كامل رسوم الاستبدال ولا تدفعين شيئاً.',
            'إذا كان الاستبدال لتغيير رأيك أو لاختلاف المقاس المطلوب: تتحمّلين رسوم التوصيل للشحنة الجديدة وقيمتها 30.00 د.أ.',
            'في حالة الاسترجاع الكامل: يُعاد إليك ثمن المنتجات، ولا تُعاد رسوم التوصيل الأصلية.',
          ]}
        />
      </PolicySection>

      <PolicySection icon={RefreshCw} title="طريقة إعادة المبلغ">
        <p>
          بما أن الدفع يتم نقداً عند الاستلام، تتم إعادة المبلغ نقداً عبر مندوب التوصيل أو بحوالة مالية على الاسم
          المسجّل في الطلب، حسب ما يناسبك. إذا كنتِ قد استخدمتِ نقاط ولاء في الطلب، تُعاد النقاط إلى رصيد حسابك.
        </p>
      </PolicySection>

      <PolicySection icon={MessageCircle} title="لبدء طلب استبدال">
        <p>
          راسلينا مباشرة على واتساب{' '}
          <a
            href={SOCIAL_LINKS.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-burgundy-500 hover:underline font-semibold"
            dir="ltr"
          >
            {SOCIAL_LINKS.whatsapp_display}
          </a>{' '}
          مع ذكر رقم الطلب، وفريقنا سيتابع معك خطوة بخطوة.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
};

export default ReturnPolicy;
