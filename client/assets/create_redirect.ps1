const fs = require('fs');
const http = require('http');

// Simple test page that sets localStorage and redirects to /
const html = 
<!DOCTYPE html>
<html>
<body>
<script>
  localStorage.setItem('onboarding_completed', 'true');
  localStorage.setItem('active_market', 'INDIA');
  window.location.href = 'http://localhost:8080/';
</script>
</body>
</html>
;
fs.writeFileSync('D:/stock market app/stock simulator/client/assets/set_storage.html', html);
