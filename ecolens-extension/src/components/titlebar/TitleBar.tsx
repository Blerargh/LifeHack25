import React from 'react';
import '../../styles/title.css';

const TitleBar: React.FC = () => (
  <div className="ecolens-title-bar">
    <img src="/greenE.png" alt="EcoLens Icon" className="ecolens-title-icon" />
    <span className="ecolens-title-text">EcoLens</span>
  </div>
);

export default TitleBar;