import React from 'react'
import '../../styles/footer.css'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SustainabilityInfo {
  criteria: string;
  value: number;
  progressBar: number; // Out of 100
  color: string; // Hex info
}

interface FooterProps {
  info: SustainabilityInfo[] | null;
}

const Footer: React.FC<FooterProps> = (props) => {
  let { info } = props

  //test
  info = [
    {
      criteria: 'test1',
      value: 100,
      progressBar: 90, // Out of 100
      color: '#fff' // Hex info
    },
    {
      criteria: 'test2',
      value: 10023,
      progressBar: 90, // Out of 100
      color: '#fff' // Hex info
    }
  ]
  const previewDisplay = info.length > 2 ? info.slice(0, 2) : info;

  return (
    <div className='footer-container'>
      <div className='bar-items-container'>
        {previewDisplay.map((displayInfo) => (
          <div className='bar-item'>
            <CircularProgressbar
              className='progress-bar'
              value={displayInfo.progressBar}
              text={`${displayInfo.value}`}
              styles={buildStyles({
                pathColor: displayInfo.color,
                textColor: '#fff',
              })}
            />
            <p className='bar-item-text'>{displayInfo.criteria}</p>
          </div>
        ))}
      </div>
      <button className='show-more-button'>Show more</button>
    </div>
  )
}

export default Footer