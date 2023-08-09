import styles from "./App.module.css";

import io from 'socket.io-client';
import {useEffect, useState, useRef} from "react";

const socket = io.connect("http://localhost:3001")
function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState([]);
  
  const effectForRef = useRef(false);
  
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  }

  const sendMessage = async () => {
    // socket에 message 전송
    const sendData = {
      username, 
      message,
      time : getCurrentTime(),
    }
    await socket.emit("send_message(toServer)", sendData);
    setAllMessage((pre)=>[...pre, sendData])
  }

  useEffect(()=>{
    if(effectForRef.current === false) {

      const fetchSocket = () => {
         // socket의 message를 읽음
        socket.on("receive_message(toClient)", (data)=>{
          setAllMessage((pre)=>[...pre, data]);
        })
      }

      fetchSocket();

    }
    return () => {
      effectForRef.current = true;
    }
  },[socket])

  return (
    <div className={styles.container}>
      <div className={styles.centeredContent}>
        <h1>Random Chat!</h1>
        <div>
          <input placeholder="userName..." onChange={(e)=>{
            setUsername(e.target.value);
          }}/>
        </div>
        <div>
          <input placeholder="Message..." onChange={(e)=>{
            setMessage(e.target.value);
          }}/>
          <button onClick={sendMessage}>
          Send Message
          </button>
        </div>
        {
          allMessage.map((data, index)=>{
            return (
              <div key={index}>
                <div>{data.username} : {data.message}</div>
              </div>
            )
          })
        } 
      </div>
      {/* <input placeholder="Message..." onChange={(e)=>{
        setMessage(e.target.value);
      }}/>
      <button onClick={sendMessage}>
        Send Message
      </button>
      <h1>Message :</h1>
      
      {
        allMessage.map((data, index)=>{
          return (
            <div key={index}>
              {data};
            </div>
          )
        })
      } */}

    </div>
  );


}

export default App;
