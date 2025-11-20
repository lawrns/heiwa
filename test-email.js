// Test script for Resend email integration
const testEmail = async () => {
  try {
    // Test the email send endpoint
    const response = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'info@heiwahouse.com', // Change this to your test email
        subject: 'Test Email from Heiwa House',
        html: '<h1>Test Email</h1><p>This is a test email to verify Resend integration is working.</p>',
        text: 'Test Email - This is a test email to verify Resend integration is working.'
      })
    });

    const data = await response.json();
    console.log('Email test result:', data);
  } catch (error) {
    console.error('Email test failed:', error);
  }
};

// Run the test
testEmail();