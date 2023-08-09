import io from 'socket.io-client';
import {useEffect, useState, useRef} from "react";

const socket = io.connect("http://localhost:3001")
function App() {
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState([]);
  const effectForRef = useRef(false);

  const sendMessage = () => {
    // socket에 message 전송
    socket.emit("send_message(toServer)", { message });
    setAllMessage((pre)=>[...pre, message])
  }

  useEffect(()=>{
    if(effectForRef.current === false) {

      const fetchSocket = () => {
         // socket의 message를 읽음
        socket.on("receive_message(toClient)", (data)=>{
          setAllMessage((pre)=>[...pre, data.message]);
        })
      }

      fetchSocket();

      return () => {
        effectForRef.current = true;
      }
    }
  },[socket])

  return (
    <div className="App">
      <input placeholder="Message..." onChange={(e)=>{
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
      }

    </div>
  );
}

export default App;
