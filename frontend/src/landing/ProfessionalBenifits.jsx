import React from 'react'
import { Users, Briefcase, UserCheck, ShieldAlert, Check } from 'lucide-react'

const ProfessionalBenifits = () => {
  const cards = [
    {
      title: 'SEO Agencies',
      description: 'Deliver repeatable audits faster with consistent white-label quality that impresses clients.',
      icon: Users,
      highlighted: true,
    },
    {
      title: 'Freelancers',
      description: 'Run project-based audits without paying for heavy monthly software tools.',
      icon: Briefcase,
      highlighted: false,
    },
    {
      title: 'Consultants',
      description: 'Turn complicated technical findings into actionable, structured suggestions.',
      icon: UserCheck,
      highlighted: false,
    },
    {
      title: 'Business Owners',
      description: 'Quickly understand your website health and what needs prioritization first.',
      icon: ShieldAlert,
      highlighted: false,
    },
  ]

  const benefits = [
    'Reduce manual SEO auditing hours',
    'Generate high-quality audit leads',
    'Improve client report communication',
    'Deploy custom white-label reports',
    'Audit without subscription fatigue',
  ]

  return (
    <section className="py-20 sm:py-28 px-6 bg-mint-surface/30 text-deep-green border-t border-border-color">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <p className="text-growth-green text-[10px] font-black uppercase tracking-[0.25em]">Workflow Advantage</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-deep-green leading-tight">
              Built for professionals who audit for results.
            </h2>
            <p className="text-muted-text text-sm sm:text-base leading-relaxed">
              Ditch complicated, subscription-heavy tools. Get exactly what you need to optimize search presence, outline value, and secure stakeholder approval.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-deep-green flex items-center justify-center text-growth-green flex-shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(5,61,52,0.1)]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-sm font-extrabold text-dark-text">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6 w-full">
          {cards.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className={`p-6 sm:p-8 rounded-[28px] border transition-all duration-300 text-left flex flex-col justify-between h-[230px] shadow-sm ${
                  item.highlighted
                    ? 'bg-deep-green text-white border-white/10 shadow-lg hover:shadow-xl'
                    : 'bg-card-white text-deep-green border-border-color hover:border-forest-green/20'
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    item.highlighted
                      ? 'bg-white/10 border-white/20 text-growth-green'
                      : 'bg-deep-green/5 border-deep-green/10 text-deep-green'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className={`font-black text-base sm:text-lg ${
                      item.highlighted ? 'text-white' : 'text-deep-green'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      item.highlighted ? 'text-white/80' : 'text-muted-text'
                    }`}>
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
