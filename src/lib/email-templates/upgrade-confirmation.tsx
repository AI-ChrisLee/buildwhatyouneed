import * as React from 'react';

interface UpgradeConfirmationEmailProps {
  userName?: string;
  userEmail: string;
  subscriptionId: string;
  amountPaid: number;
  currency: string;
  nextBillingDate?: string;
}

export const UpgradeConfirmationEmail: React.FC<UpgradeConfirmationEmailProps> = ({
  userName,
  userEmail,
  subscriptionId,
  amountPaid,
  currency,
  nextBillingDate
}) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountPaid / 100);

  return (
    <div>
      <h1>Welcome to Build What You Need Premium! 🎉</h1>
      <p>Hi {userName || userEmail},</p>
      <p>
        Congratulations! You've just unlocked premium access to Build What You Need. Your payment of {formattedAmount} has been successfully processed.
      </p>
      
      <h2>What you've unlocked:</h2>
      <ul>
        <li>🎓 Full access to all premium courses and tutorials</li>
        <li>💬 Exclusive community discussions and Q&A sessions</li>
        <li>🚀 Early access to new features and content</li>
        <li>⚡ Priority support from Chris Lee</li>
        <li>📚 Downloadable resources and code templates</li>
      </ul>
      
      <h2>Subscription Details:</h2>
      <p><strong>Subscription ID:</strong> {subscriptionId}</p>
      <p><strong>Amount paid:</strong> {formattedAmount}</p>
      {nextBillingDate && (
        <p><strong>Next billing date:</strong> {new Date(nextBillingDate).toLocaleDateString()}</p>
      )}
      
      <p>
        You can manage your subscription anytime by visiting your account settings.
      </p>
      
      <p>
        If you have any questions, feel free to reach out to me directly at me@aichrislee.com
      </p>
      
      <p>
        Happy building!<br />
        Chris Lee
      </p>
    </div>
  );
};

// Plain text version for email clients that don't support HTML
export const UpgradeConfirmationEmailText = ({
  userName,
  userEmail,
  subscriptionId,
  amountPaid,
  currency,
  nextBillingDate
}: UpgradeConfirmationEmailProps): string => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountPaid / 100);

  return `
Welcome to Build What You Need Premium! 🎉

Hi ${userName || userEmail},

Congratulations! You've just unlocked premium access to Build What You Need. Your payment of ${formattedAmount} has been successfully processed.

What you've unlocked:
- 🎓 Full access to all premium courses and tutorials
- 💬 Exclusive community discussions and Q&A sessions
- 🚀 Early access to new features and content
- ⚡ Priority support from Chris Lee
- 📚 Downloadable resources and code templates

Subscription Details:
Subscription ID: ${subscriptionId}
Amount paid: ${formattedAmount}
${nextBillingDate ? `Next billing date: ${new Date(nextBillingDate).toLocaleDateString()}` : ''}

You can manage your subscription anytime by visiting your account settings.

If you have any questions, feel free to reach out to me directly at me@aichrislee.com

Happy building!
Chris Lee
  `.trim();
};