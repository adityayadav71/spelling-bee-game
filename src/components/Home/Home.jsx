import React, { useState } from "react";
import coinsImage from "../../assets/svg/coinsImage.svg";
import { FaVolumeUp } from "react-icons/fa";

const Home = () => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [attempts, setAttempts] = useState(3);
  const [message, setMessage] = useState();
  const word = "HARSH";
  const wordarr = word.split("");
  let checkword = [];

  const updateWord = (e, index) => {
    const input = e.target;
    const value = e.target.value;
    checkword = [...wordarr];
    checkword[index] = value;
    if (e.key === "Backspace" && index - 1 >= 0) {
      input.value = "";
      input.previousElementSibling.focus();
    } else if (value !== "" && index + 1 < wordarr.length) {
      input.nextElementSibling.focus();
    }
  };

  const calculatedata = () => {
    const finalword = checkword.join("");
    if (finalword.length !== wordarr.length) {
      setMessage(<p>Please complete the word!</p>);
    } else if (finalword === word) {
      setPoints((prevPoints) => prevPoints + 10);
      setLevel((prevLevel) => prevLevel + 1);
      setMessage(<p>You got it!</p>);
    } else if (attempts > 0 && finalword != word) {
      setAttempts((prevAttempts) => prevAttempts - 1);
      setMessage(<p>Oh oh!</p>);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="ml-auto mt-6 mr-6 w-fit rounded-lg p-3 flex flex-row items-center gap-x-3 bg-secondary">
        <p className="font-bold">Level {level}</p>
        <div className="flex flex-row items-center gap-x-2 font-bold">
          <img src={coinsImage} alt="Coins" />
          <p>{points}</p>
        </div>
      </div>
      <main className="flex flex-col items-center justify-center gap-y-6 ml-auto mr-auto w-fit grow p-6">
        <div className="flex flex-row items-center justify-center w-20 h-20 rounded-full bg-secondary shadow shadow-speakerShadow mb-12">
          <FaVolumeUp className="text-5xl" />
        </div>
        <div className="flex flex-row justify-center items-center gap-x-3 mb-6">
          {wordarr.map((item, index) => (
            <input
              type="text"
              onKeyUp={(e) => updateWord(e, index)}
              data-id={index}
              key={index}
              maxLength="1"
              className="h-20 w-20 bg-accent rounded-lg text-[#1A1F16] uppercase text-4xl font-bold text-center focus:outline-none"
            />
          ))}
        </div>
        {message || (
          <button onClick={calculatedata} className="rounded-lg px-6 py-2 bg-green-500 font-bold">
            SUBMIT
          </button>
        )}
        {attempts ? (
          <div className="mt-auto bg-secondary text-white px-3 py-2 rounded-lg w-40 font-bold text-center shadow shadow-2xl hover:cursor-pointer">{attempts} attempts left</div>
        ) : (
          <div className="mt-auto text-2xl">
            The word was <span className="bg-red-500 rounded-lg px-3 py-2 text-white font-bold">{word}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
