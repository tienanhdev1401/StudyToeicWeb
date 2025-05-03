// Import the main config
import mainConfig from '../config';

// Admin specific config
const adminConfig = {
  // Use the same API base URL from the main config
  API_BASE_URL: mainConfig.API_BASE_URL,
  
  // Admin specific endpoints
  ADMIN_API_URL: `${mainConfig.API_BASE_URL}/admin`,
  
  // Upload endpoint
  UPLOAD_URL: `${mainConfig.API_BASE_URL}/upload`,
  
  // Inherit other settings from main config
  withCredentials: mainConfig.withCredentials,
};

export default adminConfig; 