export function getSubdomain(host: string) {
  console.log("XXXXXXgetSubdomain")
    // Remove port if present
    const hostWithoutPort = host.split(':')[0];
    const parts = hostWithoutPort.split('.');
    console.log("PARAAA",parts)
    // If localhost (e.g., org1.localhost)
    if (parts.length === 2 && parts[1] === 'localhost') {
      console.log(parts[0])
      return parts[0];
      
    }
  
    // If custom domain (e.g., org1.example.com, org1.lvh.me)
    if (parts.length > 2) {
      return parts[0];
    }
  
    // No subdomain
    return '';
  }