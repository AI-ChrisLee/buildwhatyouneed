// Test script to send an upgrade confirmation email
// Run with: node scripts/test-upgrade-email.js

const { Resend } = require('resend');

// Make sure to set these environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_4rDv9GfC_o8H18xZjmY5HtR7mn64XqY9W');

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Chris Lee <chris@me.aichrislee.com>',
      to: 'me@aichrislee.com', // Change this to your test email
      subject: '[TEST] Welcome to AI Chris Lee Premium!',
      html: `
        <div>
          <h1>Welcome to AI Chris Lee Premium!</h1>
          <p>Hi Test User,</p>
          <p>
            Thank you for upgrading to our premium membership! Your payment of $49.99 has been successfully processed.
          </p>
          
          <h2>What's included in your membership:</h2>
          <ul>
            <li>Access to all premium courses</li>
            <li>Exclusive community discussions</li>
            <li>Priority support</li>
            <li>New content updates</li>
          </ul>
          
          <h2>Subscription Details:</h2>
          <p><strong>Subscription ID:</strong> sub_test_123456</p>
          <p><strong>Amount paid:</strong> $49.99</p>
          <p><strong>Next billing date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          
          <p>
            You can manage your subscription anytime by visiting your account settings.
          </p>
          
          <p>
            If you have any questions, feel free to reach out to us at support@aichrislee.com
          </p>
          
          <p>
            Best regards,<br />
            The AI Chris Lee Team
          </p>
        </div>
      `,
      replyTo: 'me@aichrislee.com'
    });

    if (error) {
      console.error('Failed to send email:', error);
    } else {
      console.log('Email sent successfully!');
      console.log('Message ID:', data?.id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

sendTestEmail();