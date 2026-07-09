import React from 'react';
import AIWorkflow from './components/AIWorkflow';
import Feature from './components/Feature';
import ProfessionalBenifits from './components/ProfessionalBenifits';
import CTA from './components/CTA';
import Hero from './components/Hero';
import HeroStrip from './components/HeroStrip';
import QuickFix from './components/QuickFix';
import Reports from './components/Reports';

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
  );
};

export default Landing;
