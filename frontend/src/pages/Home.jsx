import React from 'react'
import Hero from '../components/Home/Hero'
import FeatureSection from '../components/Home/FeatureSection'
import BenefitsSection from '../components/Home/BenefitsSection'
import CTASection from '../components/Home/CTASection'

const Home = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Hero />
      <FeatureSection />
      <BenefitsSection />
      <CTASection />
    </div>
  )
}

export default Home