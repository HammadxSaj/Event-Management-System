import React from 'react';

function Footer() {
  return (
    <div className="footer" style={{ backgroundColor: "white", color: "black", textAlign: "center", padding: "10px 0" }}>
      <p>Eventiti &copy; {new Date().getFullYear()}</p>
    </div>
  );
}

export default Footer;
