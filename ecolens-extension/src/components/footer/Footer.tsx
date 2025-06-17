import React, { useEffect, useState } from 'react'
import '../../styles/footer.css'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import DetailsPopup from './DetailsPopup';
import { io } from 'socket.io-client';

const socket = io('http://localhost5000');

interface SustainabilityInfo {
  criteria: string;
  value: number;
  score: number; // Out of 100
}

interface InfoReply {
  criterias: SustainabilityInfo[];
  description: string;
}

const getColor = (score: number): string => {
  if (score >= 70) return '#4CAF50';
  if (score >= 50) return '#FFEB3B';
  if (score >= 30) return '#FF9800';
  return '#F44336';
};

const Footer: React.FC = () => {

  const [info, setInfo] = useState<InfoReply>();

  useEffect(() => {
    socket.emit('join', 123);

    // Replace with actual product info if available
    // fetch('http://localhost:5000/api/product-info', ...);

    socket.on('footerReply', (data) => {
      setInfo(data.reply);
      console.log(data);
    });

    return () => {
      socket.emit('leave', 123);
      socket.off('footerReply');
    };
  }, []);

  const [showMore, setShowMore] = useState<boolean>(false)

  if (!info) {
    return (
      <div className="footer-container" style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <span style={{ color: '#888', fontSize: 16 }}>Loading Sustainability Score...</span>
      </div>
    );
  }

  const previewDisplay = info.criterias.slice(0, 2);
  const extraDisplay = info.criterias.slice(2);

  return (
    <>
      {showMore && (
        <DetailsPopup
          info={extraDisplay}
          description={info?.description ?? ''}
          setShowPopup={setShowMore}
        />
      )}
      <div className="footer-container">
        {info ? (
          <div className="bar-items-container">
            {previewDisplay.map((item, idx) => (
              <div className="bar-item" key={idx}>
                <CircularProgressbar
                  value={item.score}
                  text={`${item.value}`}
                  styles={buildStyles({
                    pathColor: getColor(item.score),
                    textColor: '#fff',
                  })}
                />
                <p className="bar-item-text">{item.criteria}</p>
              </div>
            ))}
          </div>
        ) : (
          // Placeholder to keep layout stable
          <div className="bar-items-container" />
        )}
        {info && extraDisplay.length > 0 && (
          <button className="show-more-button" onClick={() => setShowMore(true)}>
            <span>Show</span>
            <span>More</span>
          </button>
        )}
      </div>
    </>
  );
};

export default Footer