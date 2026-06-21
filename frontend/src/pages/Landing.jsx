import React from 'react'
import Hero from '../landing/Hero'
import Feature from '../landing/Feature'
import QuickFix from '../landing/QuickFix'
import AIWorkflow from '../landing/AIWorkflow'
import ProfessionalBenifits from '../landing/ProfessionalBenifits'
import Reports from '../landing/Reports'
import CTA from '../landing/CTA'
import Footer from '../landing/Footer'

const Landing = () => {
  return (
    <>
      <Hero />
      <Feature />
      <QuickFix />
      <AIWorkflow />
      <ProfessionalBenifits />
      <Reports />
      <CTA />
      <Footer />
    </>
  )
}

export default Landing