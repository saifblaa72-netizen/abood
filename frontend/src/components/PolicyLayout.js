import { useEffect } from 'react';

const PolicyLayout = ({ icon: Icon, title, subtitle, updatedAt, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[900px]">
        <div className="text-center mb-12">
          {Icon && (
            <div className="w-16 h-16 bg-burgundy-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Icon className="w-8 h-8 text-burgundy-500" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-tajawal font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="font-cairo text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {updatedAt && (
            <p className="font-cairo text-sm text-gray-500 dark:text-gray-500 mt-4">
              آخر تحديث: {updatedAt}
            </p>
          )}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export const PolicySection = ({ icon: Icon, title, children }) => (
  <section className="bg-white dark:bg-gray-900/40 rounded-lg shadow-sm border border-gray-100 dark:border-white/10 p-6 md:p-8">
    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-tajawal font-bold mb-4">
      {Icon && <Icon className="w-6 h-6 text-burgundy-500 flex-shrink-0" />}
      {title}
    </h2>
    <div className="font-cairo text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

export const PolicyList = ({ items }) => (
  <ul className="space-y-3">
    {items.map((item, index) => (
      <li key={index} className="flex items-start gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-burgundy-500 flex-shrink-0 mt-2.5" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default PolicyLayout;
