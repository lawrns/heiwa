// Test script to send emails to both recipients
import fetch from 'node-fetch';

const sendTestEmail = async (email, name) => {
  try {
    console.log(`Sending test email to ${email}...`);

    const response = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'booking_confirmation',
        data: {
          bookingId: 'TEST-' + Date.now(),
          guestName: name,
          guestEmail: email,
          checkIn: '2024-12-15',
          checkOut: '2024-12-22',
          roomName: 'Ocean View Suite',
          totalAmount: 1500,
          currency: 'EUR',
          status: 'confirmed'
        }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Email sent successfully to ${email}!`);
      console.log('Message ID:', result.messageId);
      return { success: true, email, messageId: result.messageId };
    } else {
      console.log(`❌ Email failed to send to ${email}`);
      console.log('Error:', result.error);
      return { success: false, email, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Test failed for ${email}:`, error.message);
    return { success: false, email, error: error.message };
  }
};

// Run tests for both emails
console.log('Starting email tests to both recipients...\n');

const recipients = [
  { email: 'laurence@fyves.com', name: 'Laurence' },
  { email: 'meowcorpempire@gmail.com', name: 'MeowCorp' }
];

async function sendAllEmails() {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendTestEmail(recipient.email, recipient.name);
    results.push(result);
    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== FINAL RESULTS ===');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.email}: SUCCESS (ID: ${result.messageId})`);
    } else {
      console.log(`❌ ${result.email}: FAILED - ${result.error}`);
    }
  });
  
  console.log('\n🔍 Check your Resend dashboard at: https://resend.com/emails');
  console.log('You should see these emails with the white Heiwa House logo in the headers!');
  
  const allSuccess = results.every(r => r.success);
  process.exit(allSuccess ? 0 : 1);
}

sendAllEmails();
