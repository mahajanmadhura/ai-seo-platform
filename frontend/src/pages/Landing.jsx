import React from 'react'
import AIWorkflow from '../landing/AIWorkflow'
import Feature from '../landing/Feature'
import ProfessionalBenifits from '../landing/ProfessionalBenifits'
import CTA from '../landing/CTA'
import Hero from '../landing/Hero'
import HeroStrip from '../landing/HeroStrip'
import QuickFix from '../landing/QuickFix'
import Reports from '../landing/Reports'

const Landing = () => {
    return (
        <>
            <Hero />
            <HeroStrip />
            <Feature />
            <QuickFix />
            <AIWorkflow />
            <ProfessionalBenifits />
            <Reports />
            <CTA />
        </>
    )
}

export default Landing