const TestApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ color: '#333', marginBottom: '1rem' }}>
        React Test - Working!
      </h1>
      <p style={{ color: '#666' }}>
        If you see this, React is functioning properly
      </p>
    </div>
  );
};

export default TestApp;