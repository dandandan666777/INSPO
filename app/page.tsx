import { EmailSignup } from '@/components/email-signup';
import { LandingHeader } from '@/components/landing-header';
import { LandingHero } from '@/components/landing-hero';
import { TestimonialSection } from '@/components/testimonial-section';

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <LandingHero />
      <TestimonialSection />
      <EmailSignup />
    </>
  );
}
