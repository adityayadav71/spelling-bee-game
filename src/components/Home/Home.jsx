import React, { useState, useEffect } from "react";
import coinsImage from "../../assets/svg/coinsImage.svg";
import { FaVolumeUp } from "react-icons/fa";

const Home = () => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const word = "harsh";
  const wordarr = word.split("");
  const checkword = [];

  const updateWord = (e) => {
    const id = e.target.dataset.id;
    checkword[id] = e.target.value;
    const id1 = parseInt(id, 10) + 1;
    if (id1 < wordarr.length) {
      document.getElementById(`input-${id1}`).focus();
    }
  };

  const calculatedata = ()=>{
    const finalword = checkword.join("");
    console.log(finalword);
      if(finalword.length != wordarr.length){
        window.alert("Fill Complete Word");
      }
      else if (finalword == word) {
        setPoints((prevPoints) => prevPoints + 10);
        setLevel((prevLevel) => prevLevel + 1);
      } else if(attempts>0 && finalword != word) {
        setAttempts((prevAttempts) => prevAttempts - 1);
      }
  }
  return (
    <>
      <div className="ml-auto mr-3 mt-6 w-fit rounded-lg p-3 flex flex-row items-center gap-x-3 bg-secondary">
        <p className="font-bold">Level {level}</p>
        <div className="flex flex-row items-center gap-x-2 font-bold">
          <img src={coinsImage} alt="Coins" />
          <p>{points}</p>
        </div>
      </div>
      <main className="flex flex-col items-center justify-center gap-y-6 ml-auto mr-auto w-fit">
        <div className="flex flex-row items-center justify-center w-20 h-20 rounded-full bg-secondary shadow shadow-speakerShadow mb-12">
          <FaVolumeUp className="text-5xl" />
        </div>
        <div className="flex flex-row justify-center items-center gap-x-3 mb-6">
          {wordarr.map((item, index) => (
            <input
              type="text"
              id={`input-${index}`}
              onChange={updateWord}
              data-id={index}
              key={index}
              maxLength="1"
              className="h-20 w-20 bg-accent rounded-lg text-[#1A1F16] uppercase text-4xl font-bold text-center focus:outline-none"
            />
          ))}
        </div>
        <button onClick={calculatedata} className="rounded-lg px-6 py-2 bg-green-500 font-bold">SUBMIT</button>
        <div className="bg-secondary text-white px-3 py-2 rounded-lg w-40 font-bold text-center shadow shadow-2xl hover:cursor-pointer">{attempts} attempts left</div>
      </main>
    </>
  );
};

export default Home;
