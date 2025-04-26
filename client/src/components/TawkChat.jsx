import React, { useEffect } from 'react';

const TawkChat = () => {
  useEffect(() => {
    // Tawk.to integration script
    var Tawk_API = window.Tawk_API || {};
    var Tawk_LoadStart = new Date();
    
    (function() {
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/680cd0e829a5a6191417b73e/1ipp103eq';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    })();

    // Cleanup function (optional)
    return () => {
      // If there's a way to properly remove Tawk.to, it would go here
      // For now, this is a placeholder
    };
  }, []); // Empty dependency array ensures this runs once when component mounts

  // The component doesn't render anything visible
  return null;
};

export default TawkChat; 