import {useEffect, useState} from 'react'
import axios from 'axios'

import logo from './logo.svg';
import './App.css';

// chakra
import img0 from './imgs/chakras/0.png'
import img1 from './imgs/chakras/1.png'
import img2 from './imgs/chakras/2.png'
import img3 from './imgs/chakras/3.png'
import img4 from './imgs/chakras/4.png'
import img5 from './imgs/chakras/5.png'
import img6 from './imgs/chakras/6.png'

// sephirah
import binah from './imgs/sephirah/binah.png'
import chesed from './imgs/sephirah/chesed.png'
import chokmah from './imgs/sephirah/chokmah.png'
import daath from './imgs/sephirah/daath.png'
import geburah from './imgs/sephirah/geburah.png'
import hod from './imgs/sephirah/hod.png'
import keter from './imgs/sephirah/keter.png'
import malkuth from './imgs/sephirah/malkuth.png'
import netzach from './imgs/sephirah/netzach.png'
import tipareth from './imgs/sephirah/tipareth.png'
import yesod from './imgs/sephirah/yesod.png'

// had a dream I could breath underwater once, it was cool. 
import { Fluence } from '@fluencelabs/fluence';
import { UserList } from './UserList';
import { fluentPadApp, relayNode } from './app/constants';
import { CheckResponse, withErrorHandlingAsync } from './util';
import { join, leave, registerAppConfig } from './_aqua/app';

window.addEventListener("DOMContentLoaded",() => {
  const clock = new ProgressClock("#clock");
});

class ProgressClock {
  constructor(qs) {
    this.el = document.querySelector(qs);
    this.time = 0;
    this.updateTimeout = null;
    this.ringTimeouts = [];
    this.update();
  }
  getDayOfWeek(day) {
    switch (day) {
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        return "Sunday";
    }
  }
  getMonthInfo(mo,yr) {
    switch (mo) {
      case 1:
        return { name: "February", days: yr % 4 === 0 ? 29 : 28 };
      case 2:
        return { name: "March", days: 31 };
      case 3:
        return { name: "April", days: 30 };
      case 4:
        return { name: "May", days: 31 };
      case 5:
        return { name: "June", days: 30 };
      case 6:
        return { name: "July", days: 31 };
      case 7:
        return { name: "August", days: 31 };
      case 8:
        return { name: "September", days: 30 };
      case 9:
        return { name: "October", days: 31 };
      case 10:
        return { name: "November", days: 30 };
      case 11:
        return { name: "December", days: 31 };
      default:
        return { name: "January", days: 31 };
    }
  }
  update() {
    this.time = new Date();

    if (this.el) {
      // date and time
      const dayOfWeek = this.time.getDay();
      const year = this.time.getFullYear();
      const month = this.time.getMonth();
      const day = this.time.getDate();
      const hr = this.time.getHours();
      const min = this.time.getMinutes();
      const sec = this.time.getSeconds();
      const dayOfWeekName = this.getDayOfWeek(dayOfWeek);
      const monthInfo = this.getMonthInfo(month,year);
      const m_progress = sec / 60;
      const h_progress = (min + m_progress) / 60;
      const d_progress = (hr + h_progress) / 24;
      const mo_progress = ((day - 1) + d_progress) / monthInfo.days;
      const units = [
        {
          label: "w",
          value: dayOfWeekName
        },
        {
          label: "mo",
          value: monthInfo.name,
          progress: mo_progress
        },
        {
          label: "d", 
          value: day,
          progress: d_progress
        },
        {
          label: "h", 
          value: hr > 12 ? hr - 12 : hr,
          progress: h_progress
        },
        {
          label: "m", 
          value: min < 10 ? "0" + min : min,
          progress: m_progress
        },
        {
          label: "s", 
          value: sec < 10 ? "0" + sec : sec
        },
        {
          label: "ap",
          value: hr > 12 ? "PM" : "AM"
        }
      ];

      // flush out the timeouts
      this.ringTimeouts.forEach(t => {
        clearTimeout(t);
      });
      this.ringTimeouts = [];

      // update the display
      units.forEach(u => {
        // rings
        const ring = this.el.querySelector(`[data-ring="${u.label}"]`);

        if (ring) {
          const strokeDashArray = ring.getAttribute("stroke-dasharray");
          const fill360 = "progress-clock__ring-fill--360";

          if (strokeDashArray) {
            // calculate the stroke
            const circumference = +strokeDashArray.split(" ")[0];
            const strokeDashOffsetPct = 1 - u.progress;

            ring.setAttribute(
              "stroke-dashoffset",
              strokeDashOffsetPct * circumference
            );

            // add the fade-out transition, then remove it
            if (strokeDashOffsetPct === 1) {
              ring.classList.add(fill360);

              this.ringTimeouts.push(
                setTimeout(() => {
                  ring.classList.remove(fill360);
                }, 600)
              );
            }
          }
        }

        // digits
        const unit = this.el.querySelector(`[data-unit="${u.label}"]`);

        if (unit)
          unit.innerText = u.value;
      });
    }

    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(this.update.bind(this),1e3);
  }
}

const chakras = {
  0: img0,
  1: img1,
  2: img2,
  3: img3,
  4: img4,
  5: img5,
  6: img6
}

const chakra = {
  0: '🔴',
  1: '🟠',
  2: '🟡',
  3: '🟢',
  4: '🔵',
  5: '🧿',
  6: '🟣'
}

const sephirah = {
  0: keter,
  1: chokmah,
  2: binah,
  3: chesed,
  4: geburah,
  5: tipareth,
  6: netzach,
  7: hod,
  8: yesod,
  9: malkuth
}
let bodyMode = true

function App() {
  const [clock, setClock] = useState(0)
  const [src, setSrc] = useState('')
  const [timer, setTimer] = useState(false)
  const [mode, setMode] = useState(true)
  const [color, setColor] = useState(true)
  const [numOnline, setNumOnline] = useState(0)

  const [isConnected, setIsConnected] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [nickName, setNickName] = useState('');

  const connect = async () => {
        try {
            await Fluence.start({ connectTo: relayNode });

            setIsConnected(true);

            registerAppConfig({
                getApp: () => {
                    return fluentPadApp
                },
            })
        }
        catch (err) {
            console.log('Peer initialization failed', err)
        }
    }

    const joinRoom = async () => {
        if (!isConnected) {
            return;
        }

        await withErrorHandlingAsync(async () => {
            const res = await join( {
                peer_id: Fluence.getStatus().peerId,
                relay_id: Fluence.getStatus().relayPeerId,
                name: nickName,
            });
            if (CheckResponse(res)) {
                setIsInRoom(true);
            }
        });
    };

  useEffect(() => {
   connect()

    if(!timer){ 
      setInterval(async (mode) => {
        console.log('calling')


        if(bodyMode){
          const res = await axios.get('https://f827bf166e20.ngrok.io/step')
          console.log(res)
          const time = (new Date()).toString()
          console.log(time)
          const step = res.data.counter[(new Date()).toString()]
          console.log(chakras[step])
          // setSrc(step)
          setClock(step)
          console.log(`mode: ${bodyMode}`)
          setSrc(chakras[step])
        }
      }, 1000)

      setInterval(async (mode) => {
        console.log('calling')

        if(!bodyMode){
          const res = await axios.get('https://f827bf166e20.ngrok.io/scan')
          const time = (new Date()).toString()
          const step = res.data.sephirah[(new Date()).toString()]
          console.log(chakras[step])

          console.log('setting sephirah')
          setSrc(sephirah[step])
        }
      }, 7000)

      setTimer(true)
    }
  }, [src, mode])

  const changeMode = () => {
    setMode(!mode)
    bodyMode = !bodyMode
  }

  return (
    <div>

    {
      mode ? (
        <div className="chakra">
          <p className='ethos'>ethOStep</p>
          <div style={{marginTop: '144px'}}>
            <p style={{margin: '20px'}}>{chakra[clock]}</p>
            <img width={100} style={{textAlign: 'center'}}src={src} />
          </div>
        </div>
      ) : (
        <div className="sephirah">
          <p className='ethos'>ethOStep</p>
          <img height={300} style={{textAlign: 'center'}} src={src} />
        </div>
      )
    }
    
    <div className="App">
      <div id="clock" class="progress-clock">
      <button class="progress-clock__time-date" data-group="d" type="button">
        <small data-unit="w">Sunday</small><br/>
        <span data-unit="mo">January</span>
        <span data-unit="d">1</span>
      </button>
      <button class="progress-clock__time-digit" data-unit="h" data-group="h" type="button">12</button><span class="progress-clock__time-colon">:</span><button class="progress-clock__time-digit" data-unit="m" data-group="m" type="button">00</button><span class="progress-clock__time-colon">:</span><button class="progress-clock__time-digit" data-unit="s" data-group="s" type="button">00</button>
      <span class="progress-clock__time-ampm" data-unit="ap">AM</span>
      <svg class="progress-clock__rings" width="256" height="256" viewBox="0 0 256 256">
        <defs>
          <linearGradient id="pc-red" x1="1" y1="0.5" x2="0" y2="0.5">
            <stop offset="0%" stop-color="hsl(343,90%,55%)" />
            <stop offset="100%" stop-color="hsl(323,90%,55%)" />
          </linearGradient>
          <linearGradient id="pc-yellow" x1="1" y1="0.5" x2="0" y2="0.5">
            <stop offset="0%" stop-color="hsl(43,90%,55%)" />
            <stop offset="100%" stop-color="hsl(23,90%,55%)" />
          </linearGradient>
          <linearGradient id="pc-blue" x1="1" y1="0.5" x2="0" y2="0.5">
            <stop offset="0%" stop-color="hsl(223,90%,55%)" />
            <stop offset="100%" stop-color="hsl(203,90%,55%)" />
          </linearGradient>
          <linearGradient id="pc-purple" x1="1" y1="0.5" x2="0" y2="0.5">
            <stop offset="0%" stop-color="hsl(283,90%,55%)" />
            <stop offset="100%" stop-color="hsl(263,90%,55%)" />
          </linearGradient>
        </defs>
        <g data-units="d">
          <circle class="progress-clock__ring" cx="128" cy="128" r="74" fill="none" opacity="0.1" stroke="url(#pc-red)" stroke-width="12" />
          <circle class="progress-clock__ring-fill" data-ring="mo" cx="128" cy="128" r="74" fill="none" stroke="url(#pc-red)" stroke-width="12" stroke-dasharray="465 465" stroke-dashoffset="465" stroke-linecap="round" transform="rotate(-90,128,128)" />
        </g>
        <g data-units="h">
          <circle class="progress-clock__ring" cx="128" cy="128" r="90" fill="none" opacity="0.1" stroke="url(#pc-yellow)" stroke-width="12" />
          <circle class="progress-clock__ring-fill" data-ring="d" cx="128" cy="128" r="90" fill="none" stroke="url(#pc-yellow)" stroke-width="12" stroke-dasharray="565.5 565.5" stroke-dashoffset="565.5" stroke-linecap="round" transform="rotate(-90,128,128)" />
        </g>
        <g data-units="m">
          <circle class="progress-clock__ring" cx="128" cy="128" r="106" fill="none" opacity="0.1" stroke="url(#pc-blue)" stroke-width="12" />
          <circle class="progress-clock__ring-fill" data-ring="h" cx="128" cy="128" r="106" fill="none" stroke="url(#pc-blue)" stroke-width="12" stroke-dasharray="666 666" stroke-dashoffset="666" stroke-linecap="round" transform="rotate(-90,128,128)" />
        </g>
        <g data-units="s">
          <circle class="progress-clock__ring" cx="128" cy="128" r="122" fill="none" opacity="0.1" stroke="url(#pc-purple)" stroke-width="12" />
          <circle class="progress-clock__ring-fill" data-ring="m" cx="128" cy="128" r="122" fill="none" stroke="url(#pc-purple)" stroke-width="12" stroke-dasharray="766.5 766.5" stroke-dashoffset="766.5" stroke-linecap="round" transform="rotate(-90,128,128)" />
        </g>
      </svg>
    </div>
    <br/>
    <button style={{background: '#f8efeb', cursor: 'pointer'}}onClick={changeMode}>{mode ? '🚻' : '🙏🏻🙏🏽🙏🏿'}</button>
    <UserList/>
    </div>
  </div>

  );
}

export default App;