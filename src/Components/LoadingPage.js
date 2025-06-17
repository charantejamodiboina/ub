// components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // Or the height of your container
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay
      position: 'absolute', // To cover the content
      top: 0,
      left: 0,
      zIndex: 9999, // Ensure it's on top
      color: 'white', // For any text you might add
      flexDirection: 'column'
    }}>
      {/* This is a simple CSS spinner example. You can use a library like react-spinners for better ones. */}
      <div style={{
        border: '8px solid #f3f3f3', /* Light grey */
        borderTop: '8px solid #3498db', /* Blue */
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        animation: 'spin 2s linear infinite'
      }}></div>
      <p style={{ marginTop: '20px' }}>Loading Screen</p>

      {/* Define the spin animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;