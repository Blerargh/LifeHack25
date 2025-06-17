import React from 'react'
import { motion } from "motion/react"
import { IoMdCloseCircle } from "react-icons/io";
import '../../styles/detailspopup.css'

import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SustainabilityInfo {
  criteria: string;
  value: number;
  progressBar: number; // Out of 100
  color: string; // Hex info
}

interface Props {
  info: SustainabilityInfo[] | [];
  description: string | 'Unable to Retrieve Information';
  setShowPopup: (showPopup: boolean) => void; 
}

const DetailsPopup: React.FC<Props> = (props) => {
  const { info, description, setShowPopup } = props
  const getSeverityColor = (value: number) => {
    if (value < 33) return '#34C759';   // Red
    if (value < 66) return '#FFD60A';   // Yellow
    return '#FF3B30';                   // Green
  }

  return (
    <motion.div 
      className='details-popup-container'
      initial={{ y: 500 }}
      animate={{ y: 0, transition: { duration: 0.4 } }}
    >
      <div className='show-more-header'>
        <h3>Detailed Analysis</h3>
        <IoMdCloseCircle className='close-button' onClick={() => setShowPopup(false)}/>
      </div>
      <div className='show-more-info-container'>
        <div className='popup-bar-items-container'>
          {info.map((displayInfo) => (
            <div className='popup-bar-item'>
              <CircularProgressbar
                className='progress-bar'
                value={displayInfo.progressBar}
                text={`${displayInfo.value}`}
                styles={buildStyles({
                  pathColor: getSeverityColor(displayInfo.progressBar),
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