// Script to manually send confirmation email to a user
const { Resend } = require('resend');

const resend = new Resend('re_4rDv9GfC_o8H18xZjmY5HtR7mn64XqY9W');

async function sendConfirmationEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Chris Lee <chris@me.aichrislee.com>',
      to: 'chrisleesystem@gmail.com',
      subject: 'Welcome to AI Chris Lee Premium!',
      html: `
        <div>
          <h1>Welcome to AI Chris Lee Premium!</h1>
          <p>Hi there,</p>
          <p>
            Thank you for upgrading to our premium membership! Your payment of $97.00 has been successfully processed.
          </p>
          
          <h2>What's included in your membership:</h2>
          <ul>
            <li>Access to all premium courses</li>
            <li>Exclusive community discussions</li>
            <li>Priority support</li>
            <li>New content updates</li>
          </ul>
          
          <h2>Subscription Details:</h2>
          <p><strong>Amount paid:</strong> $97.00</p>
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
      console.log('Confirmation email sent successfully to chrisleesystem@gmail.com');
      console.log('Message ID:', data?.id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

sendConfirmationEmail();