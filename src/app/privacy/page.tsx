export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Build What You Need ("we," "us," or "our") respects your privacy and is committed to protecting your 
            personal data. This privacy policy explains how we collect, use, and safeguard your information when 
            you use our Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-lg font-medium mb-2 mt-4">Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Email address and password when you create an account</li>
            <li>Payment information processed through Stripe</li>
            <li>Content you post in threads and comments</li>
            <li>Communications with us</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Browser type and version</li>
            <li>IP address</li>
            <li>Pages visited and time spent on the Service</li>
            <li>Video viewing history within the Classroom</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain the Service</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send service-related communications</li>
            <li>Respond to your inquiries</li>
            <li>Improve and personalize the Service</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Data Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share your data with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Providers:</strong> Stripe for payment processing, Supabase for data storage</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal data. However, 
            no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We retain your personal data for as long as your account is active or as needed to provide the Service. 
            Content you post may remain visible even after account deletion unless specifically requested to be removed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Export your data</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us through the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">8. Cookies</h2>
          <p className="mb-4">
            We use essential cookies for authentication and to maintain your session. We do not use tracking 
            cookies or third-party analytics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
          <p className="mb-4">
            Our Service is not intended for children under 13. We do not knowingly collect personal information 
            from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">10. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and processed in countries other than your own. We ensure 
            appropriate safeguards are in place for such transfers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">11. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify you of significant changes by 
            posting a notice on the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
          <p className="mb-4">
            For questions about this privacy policy or our privacy practices, please contact us through the platform.
          </p>
        </section>
      </div>
    </div>
  );
}