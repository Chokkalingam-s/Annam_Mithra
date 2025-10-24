import React, { useEffect, useState } from 'react';
import { COLORS } from '../config/theme';

const Splash = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: COLORS.primary,
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.8s ease-in',
    }}>
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '70px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        padding: '20px',
        animation: 'scaleIn 0.8s ease-out',
      }}>
        <img 
          src="/src/assets/logo.png" 
          alt="Annam Mithra" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '8px',
        animation: 'fadeInUp 1s ease-out 0.3s backwards',
      }}>
        Annam Mithra
      </h1>
      
      <p style={{
        fontSize: '18px',
        color: COLORS.secondary,
        fontWeight: '500',
        animation: 'fadeInUp 1s ease-out 0.5s backwards',
      }}>
        Share Food, Share Love
      </p>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Splash;
