import React from 'react'
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
        <div className='popup-bar-items-container'>
          {info.map((displayInfo, idx) => (
            <div className='bar-item' key={idx}>
              <CircularProgressbar
                className='progress-bar'
                value={displayInfo.score}
                text={`${displayInfo.value}`}
                styles={buildStyles({
                  pathColor: getColor(displayInfo.score),
                  textColor: '#fff',
                })}
              />
              <p className='bar-item-text'>{displayInfo.criteria}</p>
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