// Test script to send a real email
import fetch from 'node-fetch';

const sendTestEmail = async () => {
  try {
    console.log('Sending test email to laurence@fyves.com...');

    const response = await fetch('http://localhost:3002/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'booking_confirmation',
        data: {
          bookingId: 'TEST-' + Date.now(),
          guestName: 'Laurence Test',
          guestEmail: 'laurence@fyves.com',
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
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\n🔍 Check your Resend dashboard at: https://resend.com/emails');
      console.log('You should see this email with ID:', result.messageId);
    } else {
      console.log('❌ Email failed to send');
      console.log('Error:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the test
console.log('Starting real email test...\n');
sendTestEmail().then(result => {
  console.log('\nFinal result:', JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});