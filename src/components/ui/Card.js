// src/components/ui/Card.jsx
import React from 'react';

const Card = ({ children }) => {
  return (
    <div className="card" style={styles.card}>
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return <div style={styles.cardContent}>{children}</div>;
};

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    margin: '10px 0',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  cardContent: {
    padding: '8px 0',
  },
};

export { Card, CardContent };
