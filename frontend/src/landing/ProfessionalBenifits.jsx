import React from 'react'
import { Users, Briefcase, UserCheck, ShieldAlert, Check } from 'lucide-react'

const ProfessionalBenifits = () => {
  const cards = [
    {
      title: 'SEO Agencies',
      description: 'Deliver repeatable audits faster with consistent report quality.',
      icon: Users,
    },
    {
      title: 'Freelancers',
      description: 'Run project-based audits without paying for heavy monthly tools.',
      icon: Briefcase,
    },
    {
      title: 'Consultants',
      description: 'Turn technical findings into clear client recommendations.',
      icon: UserCheck,
    },
    {
      title: 'Business Owners',
      description: 'Understand website health and what needs fixing first.',
      icon: ShieldAlert,
    },
  ]

  const benefits = [
    'Reduce manual SEO workload',
    'Generate qualified SEO leads',
    'Improve client communication',
    'Offer branded audit reports',
    'Scale audits without subscription fatigue',
  ]

  return (
    <section className="py-16 sm:py-24 px-6 bg-[#FDFBF7] text-black">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Title & Checklist */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black leading-tight">
              Built for professionals who audit websites for results
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Ditch complex, subscription-heavy tools. Get exactly what you need to optimize search presence and communicate value to stakeholders.
            </p>
          </div>

          {/* Business Benefits Checklist */}
          <div className="space-y-3 pt-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-[#84FF00] flex-shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-sm font-bold text-gray-800">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Cards Grid */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6 w-full">
          {cards.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group p-6 sm:p-8 rounded-[24px] bg-white border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] space-y-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#84FF00]/10 flex items-center justify-center text-gray-400 group-hover:text-black transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Copy */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-black text-base sm:text-lg group-hover:text-black transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProfessionalBenifits
