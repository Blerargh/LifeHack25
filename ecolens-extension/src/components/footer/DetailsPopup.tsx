import React, { useEffect, useRef } from 'react'
import { motion } from "motion/react"
import { IoMdCloseCircle } from "react-icons/io";
import '../../styles/detailspopup.css'

import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SustainabilityInfo {
  criteria: string;
  value: number;
  score: number; // Out of 100
}

interface Props {
  info: SustainabilityInfo[];
  description: string | 'Unable to Retrieve Information';
  setShowPopup: (showPopup: boolean) => void;
}

const getColor = (score: number): string => {
  if (score >= 70) return '#4CAF50';
  if (score >= 50) return '#FFEB3B';
  if (score >= 30) return '#FF9800';
  return '#F44336';
};

const DetailsPopup: React.FC<Props> = (props) => {
  const { info, description, setShowPopup } = props

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <motion.div
      className='details-popup-container'
      initial={{ y: 500 }}
      animate={{ y: 0, transition: { duration: 0.4 } }}
    >
      <div className='show-more-header'>
        <h3>Detailed Analysis</h3>
        <IoMdCloseCircle className='close-button' onClick={() => setShowPopup(false)} />
      </div>
      <div className='show-more-info-container'>
        <div className='popup-bar-items-container' ref={containerRef}>
          {info.map((displayInfo, idx) => (
            <div className='popup-bar-item' key={idx}>
              <p className='bar-item-text'>{displayInfo.criteria}</p>
              <CircularProgressbar
                className='progress-bar'
                value={displayInfo.score}
                text={`${displayInfo.score}`}
                styles={buildStyles({
                  pathColor: getColor(displayInfo.score),
                  textColor: '#fff',
                })}
              />
            </div>
          ))}
        </div>
        <div className='popup-description'>
          <h3>Explanation</h3>
          {description}
        </div>
      </div>
    </motion.div>
  )
}

export default DetailsPopup