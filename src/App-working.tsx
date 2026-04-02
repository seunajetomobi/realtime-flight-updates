import React from 'react';

export default function App() {
  return (
    <div style={{ height: '100vh', backgroundColor: 'black', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'lightblue' }}>
          Swairtrafiko - Test
        </h1>
        <p>Test content</p>
        <button style={{ backgroundColor: 'blue', color: 'white', padding: '8px 16px', borderRadius: '4px' }}>
          Click me
        </button>
      </div>
    </div>
  );
}
