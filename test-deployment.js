// Simple test to check if our changes are deployed
const https = require('https');

function checkDeployment() {
  const options = {
    hostname: 'heiwahauz.netlify.app',
    path: '/admin/surf-camps',
    method: 'GET',
    headers: {
      'Cookie': 'admin_auth=heiwa_admin_2024'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      const hasStatusFilter = data.includes('statusFilter') || data.includes('setStatusFilter');
      const hasExplanation = data.includes('Public booking only shows surf weeks');
      const hasFilterButtons = data.includes('All</button>') || data.includes('Active</button>');
      
      console.log('Deployment Test Results:');
      console.log('- Has statusFilter code:', hasStatusFilter);
      console.log('- Has explanation text:', hasExplanation);
      console.log('- Has filter buttons:', hasFilterButtons);
      
      if (!hasStatusFilter && !hasExplanation && !hasFilterButtons) {
        console.log('\n❌ CONFIRMED: Admin UI changes are NOT deployed');
        console.log('The deployed site is using an older version of the code.');
      } else {
        console.log('\n✅ Admin UI changes are deployed');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.end();
}

checkDeployment();
