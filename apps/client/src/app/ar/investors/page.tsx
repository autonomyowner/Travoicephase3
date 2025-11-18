"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function InvestorsPageAr() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const whatsappNumber = "966535523013"
  const whatsappMessage = "مرحباً، أنا مهتم بمعرفة المزيد عن فرصة الاستثمار في TRAVoices"
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <main className="space-y-12 sm:space-y-16 relative pb-8" dir="rtl">
      {/* Background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: '#fff8dc',
          backgroundImage: 'radial-gradient(rgba(201,162,39,0.6) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0',
        }}
      />

      {/* Hero Section */}
      <section className="text-center space-y-4 sm:space-y-6 text-slate-900 px-2 pt-4">
        <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-600/30 text-xs sm:text-sm font-semibold text-slate-800 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          عرض المستثمرين — TRAVoices
        </div>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 transition-all duration-1000 ease-out delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          كسر الحاجز الأخير أمام <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">التواصل العالمي</span>
        </h1>
        <p className={`mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-slate-700 px-2 transition-all duration-1000 delay-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          العالم يتحدث أكثر من 7,000 لغة. الأعمال تحدث في الوقت الفعلي. TRAVoices يجعل كليهما ممكناً — في نفس الوقت.
        </p>
      </section>

      {/* The Problem */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">المشكلة</h2>
        <div className="space-y-3 text-sm sm:text-base text-slate-800">
          <p className="text-base sm:text-lg font-semibold text-slate-900">
            الترجمة الصوتية الفورية غير موجودة — وهذا يكلف المليارات.
          </p>
          <ul className="space-y-2 mr-6 list-disc">
            <li>الاجتماعات التجارية الدولية تتطلب مترجمين فوريين (200-500 دولار/ساعة)</li>
            <li>فرق خدمة العملاء تحتاج موظفين متعددي اللغات لكل سوق</li>
            <li>المؤتمرات العالمية محدودة بمسارات اللغات وتأخيرات الترجمة</li>
            <li>الرعاية الصحية عن بُعد لا يمكنها التوسع عبر حواجز اللغة</li>
            <li>التعليم يبقى محصوراً بالجغرافيا واللغة</li>
          </ul>
          <div className="pt-2 border-t border-black/10 mt-4">
            <p className="font-semibold text-slate-900">الحلول الحالية غير كافية:</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="font-semibold text-sm text-red-900">المترجمون البشريون</p>
                <p className="text-xs text-red-800 mt-1">مكلف، غير قابل للتوسع، تأخير في الجدولة</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="font-semibold text-sm text-red-900">تطبيقات الترجمة النصية</p>
                <p className="text-xs text-red-800 mt-1">تفقد النبرة والعاطفة والسياق؛ توقفات محرجة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">الحل</h2>
        <p className="text-base sm:text-lg font-semibold text-slate-900">
          TRAVoices: ترجمة صوتية فورية تحافظ على صوتك ونبرتك وعواطفك.
        </p>
        <p className="text-sm sm:text-base text-slate-800">
          تحدث بشكل طبيعي بلغتك. يتم سماعك فوراً بلغتهم — بصوتك المستنسخ الذي يحمل نفس المشاعر والإيقاع والشخصية.
        </p>

        {/* How It Works */}
        <div className="pt-4 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">كيف يعمل</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <p className="font-semibold text-sm text-slate-900">1. التعرف على الكلام</p>
              <p className="text-xs text-slate-700 mt-1">Deepgram يلتقط الكلام بأي لغة بدقة تزيد عن 95٪</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <p className="font-semibold text-sm text-slate-900">2. الترجمة السياقية</p>
              <p className="text-xs text-slate-700 mt-1">DeepL API يترجم مع السياق الثقافي والتعابير والنية</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <p className="font-semibold text-sm text-slate-900">3. تركيب الصوت</p>
              <p className="text-xs text-slate-700 mt-1">ElevenLabs TTS يستنسخ صوتك باللغة المستهدفة</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300">
            <p className="font-semibold text-sm text-slate-900">إجمالي زمن الاستجابة: أقل من ثانيتين</p>
            <p className="text-xs text-slate-700 mt-1">سريع بما يكفي لتدفق المحادثة الطبيعي</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="pt-4 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">ما يميزنا</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">استنساخ الصوت</p>
              <p className="text-xs text-slate-700 mt-1">صوتك، هويتك — محفوظة عبر اللغات</p>
            </div>
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">السياق الثقافي</p>
              <p className="text-xs text-slate-700 mt-1">فهم التعابير والفكاهة والفروق الثقافية الدقيقة</p>
            </div>
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">الأداء في الوقت الفعلي</p>
              <p className="text-xs text-slate-700 mt-1">بنية LiveKit للترجمة أقل من 300 مللي ثانية</p>
            </div>
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">دعم متعدد اللغات</p>
              <p className="text-xs text-slate-700 mt-1">أكثر من 50 لغة ولهجة، في توسع مستمر</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">المجموعة التقنية</h2>
        <p className="text-sm sm:text-base text-slate-800">
          مبني على بنية تحتية مختبرة مع أفضل مزودي الذكاء الاصطناعي:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">الواجهة الأمامية</p>
            <p className="text-xs text-slate-700 mt-1">Next.js 15, React 19, Tailwind CSS</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">الصوت في الوقت الفعلي</p>
            <p className="text-xs text-slate-700 mt-1">LiveKit (WebRTC، زمن استجابة منخفض جداً)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">ترجمة الذكاء الاصطناعي</p>
            <p className="text-xs text-slate-700 mt-1">DeepL API (دقة 99٪)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">تركيب الصوت</p>
            <p className="text-xs text-slate-700 mt-1">ElevenLabs (TTS متعدد اللغات)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">التعرف على الكلام</p>
            <p className="text-xs text-slate-700 mt-1">Deepgram (دقة تزيد عن 95٪)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">الخادم الخلفي</p>
            <p className="text-xs text-slate-700 mt-1">Node.js, Express, Python agents</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">قاعدة البيانات</p>
            <p className="text-xs text-slate-700 mt-1">Supabase (PostgreSQL + Auth)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">النشر</p>
            <p className="text-xs text-slate-700 mt-1">Vercel, Render, Docker</p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">خارطة الطريق التطويرية</h2>

        <div className="space-y-4">
          {/* Phase 1 - Completed */}
          <div className="p-4 rounded-lg bg-green-50 border-r-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-green-900">المرحلة 1: الأساس (مكتملة)</h3>
              <span className="text-xs font-semibold text-green-700 px-2 py-1 rounded bg-green-200">مباشر</span>
            </div>
            <ul className="space-y-1 text-sm text-green-800 mr-4 list-disc">
              <li>غرف صوتية في الوقت الفعلي مع تكامل LiveKit</li>
              <li>واجهة متعددة اللغات (الإنجليزية + العربية مع دعم RTL)</li>
              <li>مصادقة المستخدم وإدارة الغرف</li>
              <li>تسجيل وتشغيل الصوت الأساسي</li>
            </ul>
          </div>

          {/* Phase 2 - Current */}
          <div className="p-4 rounded-lg bg-blue-50 border-r-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-blue-900">المرحلة 2: محرك الترجمة (الحالية)</h3>
              <span className="text-xs font-semibold text-blue-700 px-2 py-1 rounded bg-blue-200">قيد التنفيذ</span>
            </div>
            <ul className="space-y-1 text-sm text-blue-800 mr-4 list-disc">
              <li>عامل Python للترجمة في الوقت الفعلي</li>
              <li>تكامل Deepgram STT (متعدد اللغات)</li>
              <li>تكامل DeepL API للترجمة</li>
              <li>ElevenLabs TTS مع استنساخ الصوت</li>
              <li>إرسال مهام LiveKit والانضمام إلى الغرفة</li>
              <li>اختبار الترجمة من البداية إلى النهاية (قيد التنفيذ)</li>
              <li>تحسين زمن الاستجابة (هدف أقل من ثانيتين)</li>
            </ul>
          </div>

          {/* Phase 3 - Planned */}
          <div className="p-4 rounded-lg bg-purple-50 border-r-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-purple-900">المرحلة 3: ميزات متقدمة (الربع الأول 2026)</h3>
              <span className="text-xs font-semibold text-purple-700 px-2 py-1 rounded bg-purple-200">مخطط</span>
            </div>
            <ul className="space-y-1 text-sm text-purple-800 mr-4 list-disc">
              <li>استنساخ صوتي مخصص (نماذج TTS شخصية)</li>
              <li>نصوص وملخصات الاجتماعات</li>
              <li>API لتكاملات الطرف الثالث</li>
              <li>لوحة معلومات المؤسسات والتحليلات</li>
              <li>دعم غرف متعددة المتحدثين (3+ أشخاص)</li>
              <li>تطبيقات الجوال (iOS + Android)</li>
            </ul>
          </div>

          {/* Phase 4 - Vision */}
          <div className="p-4 rounded-lg bg-amber-50 border-r-4 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-amber-900">المرحلة 4: التوسع والمؤسسات (الربع الثاني 2026)</h3>
              <span className="text-xs font-semibold text-amber-700 px-2 py-1 rounded bg-amber-200">الرؤية</span>
            </div>
            <ul className="space-y-1 text-sm text-amber-800 mr-4 list-disc">
              <li>تكامل الهاتف (PSTN، VoIP)</li>
              <li>SDKs لمؤتمرات الفيديو (Zoom، Teams، Meet)</li>
              <li>خيارات النشر داخل المؤسسة</li>
              <li>حلول العلامة البيضاء للمؤسسات</li>
              <li>التعلم السياقي المدعوم بالذكاء الاصطناعي (يتحسن مع الوقت)</li>
              <li>دعم أكثر من 100 لغة</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">فرصة السوق</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700">السوق الإجمالي القابل للتوجيه (TAM)</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">56 مليار دولار</p>
            <p className="text-xs text-slate-700 mt-1">سوق خدمات اللغة العالمي بحلول 2027</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <p className="text-xs font-semibold text-purple-700">السوق القابل للخدمة (SAM)</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">12 مليار دولار</p>
            <p className="text-xs text-slate-700 mt-1">الترجمة الفورية وتقنية الصوت</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700">السوق القابل للحصول عليه (SOM)</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">600 مليون دولار</p>
            <p className="text-xs text-slate-700 mt-1">التركيز على المؤسسات والشركات الصغيرة (استحواذ 5٪ في 5 سنوات)</p>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">الأسواق المستهدفة</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">المؤسسات</p>
              <p className="text-xs text-slate-700 mt-1">الفرق العالمية، خدمة العملاء، المبيعات الدولية</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">التعليم</p>
              <p className="text-xs text-slate-700 mt-1">الدورات عبر الإنترنت، الجامعات الدولية، الدروس الخصوصية</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">الرعاية الصحية</p>
              <p className="text-xs text-slate-700 mt-1">الرعاية الصحية عن بُعد، استشارات المرضى، السياحة الطبية</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">الاتصالات</p>
              <p className="text-xs text-slate-700 mt-1">المكالمات الدولية، خدمة العملاء، التجوال</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">المبدعون والألعاب</p>
              <p className="text-xs text-slate-700 mt-1">البث المباشر، البودكاست، ألعاب متعددة اللاعبين</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">الحكومة</p>
              <p className="text-xs text-slate-700 mt-1">الدبلوماسية، خدمات اللاجئين، الخدمات العامة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">نموذج العمل</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">نموذج فريميوم (B2C)</p>
            <p className="text-xs text-slate-700 mt-2">المستوى المجاني: 100 دقيقة/شهر</p>
            <p className="text-xs text-slate-700">Pro: 19 دولار/شهر (غير محدود)</p>
            <p className="text-xs text-slate-700">الفرق: 49 دولار/مستخدم/شهر</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">المؤسسات (B2B)</p>
            <p className="text-xs text-slate-700 mt-2">تسعير مخصص بناءً على:</p>
            <p className="text-xs text-slate-700">• الدقائق المستخدمة</p>
            <p className="text-xs text-slate-700">• عدد المقاعد</p>
            <p className="text-xs text-slate-700">• متطلبات SLA</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">الوصول إلى API</p>
            <p className="text-xs text-slate-700 mt-2">نموذج الدفع لكل دقيقة:</p>
            <p className="text-xs text-slate-700">0.10 دولار/دقيقة (قياسي)</p>
            <p className="text-xs text-slate-700">خصومات الحجم متاحة</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">الفريق</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">نــاصـر آل خازم</p>
            <p className="text-sm text-slate-700 mt-1">المؤسس والرئيس التنفيذي</p>
            <p className="text-xs text-slate-600 mt-2">
              قائد صاحب رؤية مع خبرة عميقة في أنظمة الاتصال المدعومة بالذكاء الاصطناعي.
              شغوف بكسر حواجز اللغة من خلال التكنولوجيا.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">فريق التطوير</p>
            <p className="text-sm text-slate-700 mt-1">مهندسو Full-Stack وأخصائيو الذكاء الاصطناعي</p>
            <p className="text-xs text-slate-600 mt-2">
              فريق ذو خبرة في بناء بنية تحتية صوتية متطورة في الوقت الفعلي باستخدام
              LiveKit و Next.js ونماذج الذكاء الاصطناعي المتقدمة.
            </p>
          </div>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="rounded-xl border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">فرصة الاستثمار</h2>

        <div className="space-y-3">
          <p className="text-base sm:text-lg text-slate-800">
            نحن نجمع جولة تمويل أولية لتسريع التطوير وإطلاق TRAVoices في السوق.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-white border border-yellow-300">
              <p className="font-semibold text-sm text-slate-900">استخدام الأموال</p>
              <ul className="text-xs text-slate-700 mt-2 space-y-1 mr-4 list-disc">
                <li>ضبط نماذج الذكاء الاصطناعي وتحسينها</li>
                <li>توسيع البنية التحتية (LiveKit، السحابة)</li>
                <li>توسيع فريق الهندسة</li>
                <li>الدخول إلى السوق والمبيعات</li>
                <li>تطوير الشراكات</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-white border border-yellow-300">
              <p className="font-semibold text-sm text-slate-900">المعالم الرئيسية</p>
              <ul className="text-xs text-slate-700 mt-2 space-y-1 mr-4 list-disc">
                <li>إكمال المرحلة 2 (محرك الترجمة)</li>
                <li>10,000+ مستخدم نشط</li>
                <li>5+ برامج تجريبية للمؤسسات</li>
                <li>إطلاق API ونظام المطورين البيئي</li>
                <li>الجاهزية للجولة A (18 شهر)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          >
            تواصل عبر واتساب
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold border-2 border-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 text-slate-900"
          >
            جدولة عرض توضيحي
          </a>
        </div>
      </section>

      {/* Social Proof / Traction */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">لماذا الآن؟</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">القوى العاملة العالمية</p>
            <p className="text-xs text-slate-700 mt-1">
              انفجار العمل عن بُعد يتطلب تواصلاً سلساً عبر الحدود
            </p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">نضج الذكاء الاصطناعي</p>
            <p className="text-xs text-slate-700 mt-1">
              STT والترجمة وTTS وصلت إلى جودة على مستوى الإنتاج
            </p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">بنية WebRTC التحتية</p>
            <p className="text-xs text-slate-700 mt-1">
              البنية التحتية للاتصال في الوقت الفعلي أصبحت سلعة وقابلة للتوسع
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 text-slate-900 px-2 py-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
          انضم إلينا في كسر حواجز اللغة
        </h2>
        <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto">
          كن جزءاً من الفريق الذي يبني طبقة الصوت العالمية للبشرية.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          >
            تواصل معنا
          </a>
          <Link
            href="/ar/rooms"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold border border-slate-300 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
          >
            جرب العرض التوضيحي المباشر
          </Link>
        </div>
      </section>
    </main>
  )
}
