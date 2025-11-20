// Test script for email API
import fetch from 'node-fetch';

const testEmail = async () => {
  try {
    console.log('Testing email API...');

    const response = await fetch('http://localhost:3002/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'custom',
        data: {
          to: 'delivered@resend.dev',
          subject: 'Test Email - Resend Integration',
          html: '<h1>Success!</h1><p>Your Resend email integration is working correctly.</p>',
          text: 'Success! Your Resend email integration is working correctly.'
        }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
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
console.log('Starting email test...');
testEmail().then(result => {
  console.log('\nFinal result:', JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});