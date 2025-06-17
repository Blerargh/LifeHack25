import React, { useState } from 'react'
import '../../styles/footer.css'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import DetailsPopup from './DetailsPopup';

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

  const [showMore, setShowMore] = useState<boolean>(false)
  const handleShowMoreClick = () => {
    setShowMore(true);
  }


  let { info } = props

  // for testing (to be removed)
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
    },
    {
      criteria: 'test2',
      value: 10023,
      progressBar: 90, // Out of 100
      color: '#fff' // Hex info
    },
    {
      criteria: 'test2',
      value: 10023,
      progressBar: 90, // Out of 100
      color: '#fff' // Hex info
    },
    {
      criteria: 'test2',
      value: 10023,
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
    <>
      {showMore ? <DetailsPopup info={info} description={'lorem ipsum'} setShowPopup={setShowMore}/> : <></>}
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
        <button className='show-more-button' onClick={handleShowMoreClick}>Show more →</button>
      </div>
    </>
  )
}

export default Footer