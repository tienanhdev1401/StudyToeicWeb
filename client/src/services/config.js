// API Configuration
const config = {
  // Base URL for the API
  // In development, we use relative URLs because of the proxy in package.json
  // In production, we use the full domain
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://hostserver.tptienanh.website/api'
    : '/api',
  
  // Other common config values can go here
  withCredentials: true,
};

export default config;

// Helper function to get the full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if it exists to avoid double slashes
  const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${config.API_BASE_URL}/${path}`;
}; 