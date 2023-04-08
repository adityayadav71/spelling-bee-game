import React, { useState, useRef, useEffect } from "react";
import coinsImage from "../../assets/svg/coinsImage.svg";
import checkmark from "../../assets/svg/checkmark.svg";
import cross from "../../assets/svg/cross.svg";
import data from "../../data.json";
import successAudioFile from "../../assets/success.mp3";
import errorAudioFile from "../../assets/error.mp3";
import failureAudioFile from "../../assets/failure.mp3";
import { FaVolumeUp } from "react-icons/fa";
import { RxMagnifyingGlass } from "react-icons/rx";
import { fetchWordDetails } from "../../api";

const Home = () => {
  const [word, setWord] = useState("DEFAULT");
  const [incorrect, setIncorrect] = useState(true);
  const [points, setPoints] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(parseInt(JSON.parse(localStorage?.getItem("stats"))?.coins) || 0);
  const [success, setSuccess] = useState(false);
  const [level, setLevel] = useState(parseInt(JSON.parse(localStorage?.getItem("stats"))?.level) || 1);
  const [attempts, setAttempts] = useState(3);
  const [message, setMessage] = useState();
  const [checkword, setCheckWord] = useState(new Array(word.length).fill(""));
  const [wordAudio, setWordAudio] = useState(null);
  const [successAudio, setSuccessAudio] = useState(null);
  const [errorAudio, setErrorAudio] = useState(null);
  const [failureAudio, setFailureAudio] = useState(null);

  const newWord = async () => {
    const random = Math.floor(Math.random() * 100) + 1;
    const word = data.words[random];
    setWord(word.toUpperCase());

    const audioURL = await fetchWordDetails(word);
    const wordAudio = new Audio(audioURL);
    wordAudio.preload = "auto";
    setWordAudio(wordAudio);
  };

  useEffect(() => {
    const gameStats = {
      level: level,
      coins: points,
    };
    localStorage.setItem("stats", JSON.stringify(gameStats));
    newWord();

    const audio = new Audio(successAudioFile);
    audio.preload = "auto";
    setSuccessAudio(audio);

    const audio2 = new Audio(errorAudioFile);
    audio2.preload = "auto";
    setErrorAudio(audio2);

    const audio3 = new Audio(failureAudioFile);
    audio3.preload = "auto";
    setFailureAudio(audio3);

    setTimeout(() => {
      if (!success) {
        setMessage(
          <button onClick={displayHints} className="px-6 py-2 bg-yellow-200 hover:bg-yellow-100 animate-expand opacity-0 text-black rounded-full w-fit flex flex-row items-center gap-x-2 font-bold">
            <div className="flex items-center justify-center font-bold bg-yellow-500 w-5 h-5 text-sm rounded-full">
              <RxMagnifyingGlass />
            </div>
            Hint
          </button>
        );
      }
    }, 10000);
  }, [level, points]);

  const wordarr = word.split("");

  // Focus on first input textbox by default
  const firstInput = useRef(null);
  useEffect(() => {
    if (firstInput.current) {
      firstInput.current.focus();
    }
  }, []);

  // Add current level points to total points
  useEffect(() => {
    setPoints((prevPoints) => prevPoints + currentPoints);
  }, [currentPoints]);

  // Update the word array for every keystroke in form
  const updateWord = (e, index) => {
    const input = e.target;
    const value = e.target.value;
    setCheckWord((prevWord) => {
      const newWord = prevWord;
      newWord[index] = value;
      return newWord;
    });
    if (e.key === "Backspace" && input.value === "" && index - 1 >= 0) {
      input.value = "";
      input.previousElementSibling.focus();
    } else if (e.key === "ArrowLeft" && index - 1 >= 0) {
      input.previousElementSibling.focus();
    } else if (e.key === "ArrowRight" && index + 1 < wordarr.length) {
      input.nextElementSibling.focus();
    } else if (value !== "" && index + 1 < wordarr.length && ((e.keyCode >= 65 && e.keyCode <= 92) || (e.keyCode >= 97 && e.keyCode <= 122))) {
      input.nextElementSibling.focus();
    }
  };

  const resetWord = () => {
    newWord();
  };

  const nextLevel = () => {
    setLevel((prevLevel) => prevLevel + 1);
    resetWord();
    window.location.reload(true);
  };

  const displayHints = () => {};

  const playAudio = () => {
    wordAudio.play();
  };

  const matchWord = () => {
    setMessage("");
    const finalword = checkword.join("").toUpperCase();
    // If word is not complete
    if (finalword.length !== wordarr.length) {
      errorAudio.play();
      Array.from(document.getElementsByTagName("input")).forEach((el) => {
        if (el.value === "" || el.value === " ") el.style.backgroundColor = "rgb(239 68 68)";
      });
      setMessage(<p>Please complete the word!</p>);
      // On correct answer
    } else if (finalword === word) {
      successAudio.play();
      Array.from(document.getElementsByTagName("input")).forEach((el) => {
        el.style.backgroundColor = "rgb(34 197 94)";
        el.setAttribute("disabled", true);
      });
      setIncorrect(false);
      setSuccess(true);
      4 - attempts === 1 ? setCurrentPoints(30) : 4 - attempts === 2 ? setCurrentPoints(20) : setCurrentPoints(10);
      // On incorrect answer but attempts still left
    } else if (attempts > 1 && finalword !== word) {
      errorAudio.play();
      setAttempts((prevAttempts) => prevAttempts - 1);
      // On attempts finished
    } else if (attempts === 1) {
      failureAudio.play();
      setAttempts((prevAttempts) => prevAttempts - 1);
      setIncorrect(false);
      Array.from(document.getElementsByTagName("input")).forEach((el) => {
        el.style.backgroundColor = "rgb(239 68 68)";
        el.style.color = "white";
        el.setAttribute("disabled", true);
      });
      setMessage(
        <button onClick={resetWord} className="p-3 bg-green-500 text-white font-bold rounded-lg">
          Try this level again?
        </button>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative ml-auto mt-6 mr-6 w-fit rounded-lg p-3 flex flex-row items-center gap-x-3 bg-secondary">
        <p className="font-bold">Level {level}</p>
        <div className="flex flex-row items-center gap-x-2 font-bold">
          <img src={coinsImage} alt="Coins" />
          <p>{points}</p>
        </div>
        {success && <div className="absolute top-full right-3 text-yellow-500 font-bold animate-up"> + {currentPoints}</div>}
      </div>
      <main className="flex flex-col items-center justify-center gap-y-6 ml-auto mr-auto w-fit grow p-6">
        <button
          onClick={playAudio}
          className="flex flex-row items-center justify-center w-20 h-20 rounded-full bg-secondary shadow-speakerShadow hover:w-24 hover:h-24  hover:shadow-speakerShadowEnhanced hover:cursor-pointer my-2 hover:bg-secondary transition-width duration-300"
        >
          <FaVolumeUp className="text-5xl" />
        </button>
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col justify-center items-center gap-y-3 mb-4">
          <div className="flex flex-row justify-center items-center gap-x-3 mb-6">
            {wordarr.map((item, index) => (
              <input
                ref={index === 0 ? firstInput : null}
                type="text"
                onKeyUp={(e) => updateWord(e, index)}
                data-id={index}
                key={index}
                maxLength="1"
                className="h-20 w-20 bg-accent focus:bg-green-500 rounded-lg text-[#1A1F16] uppercase text-4xl font-bold text-center focus:outline-none"
              />
            ))}
          </div>
          {message}
          {incorrect ? (
            <button id="submitBtn" onClick={matchWord} className="transition duration-300 rounded-lg px-6 py-2 bg-green-500 font-bold">
              SUBMIT
            </button>
          ) : (
            <button onClick={nextLevel} className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg">
              Next Level
            </button>
          )}
        </form>
        {success && (
          <div className="animate-check flex flex-row items-center justify-center bg-green-800 w-10 h-10 rounded-full">
            <img src={checkmark} alt="checkmark" />
          </div>
        )}
        {attempts ? (
          <div className="mt-auto bg-secondary text-white px-3 py-2 rounded-lg w-fit font-bold text-center shadow-2xl hover:cursor-pointer">
            {incorrect ? (
              <>
                <span className={`px-3 py-1 ${attempts === 3 ? "bg-green-500" : attempts === 2 ? "bg-yellow-500" : "bg-red-500"} rounded-lg mr-3 transition duration-300`}>{attempts}</span> attempts
                left
              </>
            ) : (
              <>
                You took
                <span className={`px-3 py-1 ${attempts === 3 ? "bg-green-500" : attempts === 2 ? "bg-yellow-500" : "bg-red-500"} rounded-lg mx-3 transition duration-300`}>{4 - attempts}</span>
                attempt{4 - attempts === 1 ? "" : "s"}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="animate-check flex flex-row items-center justify-center bg-red-800 w-10 h-10 rounded-full">
              <img src={cross} alt="cross" />
            </div>
            <div className="mt-auto text-2xl animate-error">
              The word was <span className="bg-red-500 rounded-lg px-3 py-2 text-white font-bold">{word}</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
