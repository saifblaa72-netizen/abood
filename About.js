import React from 'react';

const About = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <h1 className="text-4xl md:text-5xl font-tajawal font-bold text-center mb-8">من نحن</h1>
        <div className="prose prose-lg mx-auto font-cairo">
          <p className="text-xl leading-relaxed">
            وهيبة فاشن هو متجر إلكتروني متخصص في بيع الملابس النسائية العصرية والأنيقة بأعلى معايير الجودة والأناقة.
          </p>
          <p className="leading-relaxed">
            نسعى لتقديم تجربة تسوق فريدة ومميزة لعملائنا من خلال توفير تشكيلة واسعة من الأزياء العصرية والكلاسيكية التي تناسب جميع الأذواق والمناسبات.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
