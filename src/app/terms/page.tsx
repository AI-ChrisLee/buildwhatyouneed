export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using Build What You Need ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Build What You Need provides a community platform for builders and entrepreneurs. The Service includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Discussion threads and community forums</li>
            <li>Educational video content through our Classroom</li>
            <li>Weekly office hours and live sessions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Membership and Payment</h2>
          <p className="mb-4">
            Access to the Service requires a paid membership at $97/month. Payment is processed through Stripe. 
            By subscribing, you authorize us to charge your payment method on a recurring monthly basis.
          </p>
          <p className="mb-4">
            You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. User Conduct</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
            <li>Impersonate any person or entity</li>
            <li>Share your account credentials with others</li>
            <li>Use the Service for any unauthorized commercial purposes</li>
            <li>Attempt to gain unauthorized access to any portion of the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Content Rights</h2>
          <p className="mb-4">
            You retain ownership of content you post to the Service. By posting content, you grant us a non-exclusive, 
            worldwide license to use, display, and distribute your content within the Service.
          </p>
          <p className="mb-4">
            All course materials, videos, and platform content remain our intellectual property. 
            You may not reproduce, distribute, or create derivative works without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Privacy</h2>
          <p className="mb-4">
            Your use of the Service is subject to our Privacy Policy. We respect your privacy and handle your data 
            in accordance with applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Disclaimers</h2>
          <p className="mb-4">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that the Service 
            will be uninterrupted or error-free. Any advice or information received through the Service should not 
            be relied upon for personal, business, or financial decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
            CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">9. Termination</h2>
          <p className="mb-4">
            We reserve the right to terminate or suspend your account at our discretion, without notice, 
            for conduct that we believe violates these Terms or is harmful to other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
          <p className="mb-4">
            We may modify these Terms at any time. Continued use of the Service after changes constitutes 
            acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
          <p className="mb-4">
            For questions about these Terms, please contact us through the platform.
          </p>
        </section>
      </div>
    </div>
  );
}