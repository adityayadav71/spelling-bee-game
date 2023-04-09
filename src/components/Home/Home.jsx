import React, { useState, useRef, useEffect } from "react";
import coinsImage from "../../assets/svg/coinsImage.svg";
import checkmark from "../../assets/svg/checkmark.svg";
import cross from "../../assets/svg/cross.svg";
import data from "../../data.json";
import successAudioFile from "../../assets/success.mp3";
import errorAudioFile from "../../assets/error.mp3";
import failureAudioFile from "../../assets/failure.mp3";
import { FaUndo, FaVolumeUp } from "react-icons/fa";
import { RxMagnifyingGlass } from "react-icons/rx";
import { fetchWordDetails } from "../../api";

const Home = () => {
  // Word
  const [wordDetails, setWordDetails] = useState({
    word: "DEFAULT",
    wordarr: ["D", "E", "F", "A", "U", "L", "T"],
    wordAudio: null,
    checkword: [],
    hints: [],
  });
  // Game Stats
  const [userStats, setUserStats] = useState({
    level: parseInt(JSON.parse(localStorage?.getItem("stats"))?.level) || 1,
    points: parseInt(JSON.parse(localStorage?.getItem("stats"))?.coins) || 0,
    attempts: 3,
    currentPoints: 0,
  });
  // Hints
  const [hintVisible, setHintVisible] = useState(false);
  const [showHints, setShowHints] = useState(false);
  // Game State
  const [success, setSuccess] = useState(false);
  const [incorrect, setIncorrect] = useState(true);
  const [message, setMessage] = useState();
  // Audio
  const [successAudio, setSuccessAudio] = useState(null);
  const [errorAudio, setErrorAudio] = useState(null);
  const [failureAudio, setFailureAudio] = useState(null);

  const __init__ = () => {
    // Load Word Audio File
    newWord();
    setShowHints(false);
    setMessage(null);
    setSuccess(false);
    setIncorrect(true);
    setUserStats((prevStats) => {
      return {
        ...prevStats,
        attempts: 3,
      };
    });

    Array.from(document.getElementsByTagName("input")).forEach((el) => {
      el.value = "";
      el.style.color = "black"
      el.style.backgroundColor = "rgb(148 236 190)";
      el.removeAttribute("disabled");
      firstInput.current.focus();
    });
  };

  const newWord = async () => {
    const random = Math.floor(Math.random() * 100) + 1;
    let word = data.words[random];

    let apiData = await fetchWordDetails(word);
    let audioURL = apiData.audio;
    let hints = apiData.hints;

    if (!audioURL) {
      const random = Math.floor(Math.random() * 100) + 1;
      word = data.words[random];
      audioURL = await fetchWordDetails(word);
    }

    const wordAudio = new Audio(audioURL);
    wordAudio.preload = "auto";
    setWordDetails((prevWord) => {
      return {
        ...prevWord,
        word: word.toUpperCase(),
        wordarr: word.split(""),
        wordAudio: wordAudio,
        checkword: new Array(word.length).fill(""),
        hints,
      };
    });
  };

  useEffect(() => {
    const gameStats = {
      level: userStats.level,
      coins: userStats.points,
    };
    localStorage.setItem("stats", JSON.stringify(gameStats));

    setUserStats((prevStats) => {
      return { ...prevStats, points: prevStats.points + userStats.currentPoints };
    });

    setHintVisible(false);

    setTimeout(() => {
      displayHints();
    }, 2000);
  }, [userStats.level]);

  // Init application state, Focus on first input textbox by default
  const firstInput = useRef(null);
  useEffect(() => {
    __init__();

    if (firstInput.current) {
      firstInput.current.focus();
    }

    const audio = new Audio(successAudioFile);
    audio.preload = "auto";
    setSuccessAudio(audio);

    const audio2 = new Audio(errorAudioFile);
    audio2.preload = "auto";
    setErrorAudio(audio2);

    const audio3 = new Audio(failureAudioFile);
    audio3.preload = "auto";
    setFailureAudio(audio3);
  }, []);

  // Update the word array for every keystroke in form
  const updateWord = (e, index) => {
    const input = e.target;
    const value = e.target.value;
    setWordDetails((prevWord) => {
      const newWord = prevWord.checkword;
      newWord[index] = value;
      return {
        ...prevWord,
        checkword: newWord,
      };
    });
    if (e.key === "Backspace" && input.value === "" && index - 1 >= 0) {
      input.value = "";
      input.previousElementSibling.focus();
    } else if (e.key === "ArrowLeft" && index - 1 >= 0) {
      input.previousElementSibling.focus();
    } else if (e.key === "ArrowRight" && index + 1 < wordDetails.wordarr.length) {
      input.nextElementSibling.focus();
    } else if (value !== "" && index + 1 < wordDetails.wordarr.length && ((e.keyCode >= 65 && e.keyCode <= 92) || (e.keyCode >= 97 && e.keyCode <= 122))) {
      input.nextElementSibling.focus();
    }
  };

  const nextLevel = () => {
    setUserStats((prevStats) => {
      return { ...prevStats, level: prevStats.level + 1 };
    });
    __init__();
  };

  const displayHints = () => {
    setHintVisible(true);
  };

  const expandHints = () => {
    setShowHints((prevState) => !prevState);
  };

  const playAudio = () => {
    wordDetails.wordAudio.play();
  };

  const matchWord = () => {
    setMessage("");
    const finalword = wordDetails.checkword.join("").toUpperCase();
    // If word is not complete
    if (finalword.length !== wordDetails.wordarr.length) {
      errorAudio.play();
      Array.from(document.getElementsByTagName("input")).forEach((el) => {
        if (el.value === "" || el.value === " ") el.style.backgroundColor = "rgb(239 68 68)";
      });
      setMessage(<p>Please complete the word!</p>);
      // On correct answer
    } else if (finalword === wordDetails.word) {
      successAudio.play();
      Array.from(document.getElementsByTagName("input")).forEach((el) => {
        el.style.backgroundColor = "rgb(34 197 94)";
        el.setAttribute("disabled", true);
      });
      setIncorrect(false);
      setSuccess(true);
      4 - userStats.attempts === 1
        ? setUserStats((prevStats) => {
            return { ...prevStats, currentPoints: 30 };
          })
        : 4 - userStats.attempts === 2
        ? setUserStats((prevStats) => {
            return { ...prevStats, currentPoints: 20 };
          })
        : setUserStats((prevStats) => {
            return { ...prevStats, currentPoints: 10 };
          });
      // On incorrect answer but attempts still left
    } else if (userStats.attempts > 1 && finalword !== wordDetails.word) {
      errorAudio.play();
      setUserStats((prevStats) => {
        return { ...prevStats, attempts: prevStats.attempts - 1 };
      });
      // On attempts finished
    } else if (userStats.attempts === 1) {
      failureAudio.play();
      setUserStats((prevStats) => {
        return { ...prevStats, attempts: prevStats.attempts - 1 };
      });
      setIncorrect(false);
      Array.from(document.getElementsByTagName("input")).forEach((el) => {
        el.style.backgroundColor = "rgb(239 68 68)";
        el.style.color = "white";
        el.setAttribute("disabled", true);
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={expandHints}
            className={`px-6 py-2 mt-6 ml-6 mr-auto bg-yellow-200 hover:bg-yellow-100 ${
              hintVisible ? "animate-expand" : ""
            } opacity-0 text-black rounded-full w-fit flex flex-row items-center gap-x-2 font-bold`}
          >
            <div className="flex items-center justify-center font-bold bg-yellow-500 w-5 h-5 text-sm rounded-full">
              <RxMagnifyingGlass />
            </div>
            Hint
          </button>
          {showHints && (
            <div className={`absolute ${expandHints ? "animate-expand" : ""} opacity-0 top-20 left-6 rounded-xl w-48 p-3 h-fit text-black bg-white shadow-speakerShadow`}>
              {wordDetails.hints.length !== 0 ? (
                wordDetails.hints.map((hint, index) => (
                  <div className="mb-3" key={index}>
                    <h1 className="text-lg font-bold">{hint.partOfSpeech}</h1>
                    <p className="text-xs">{hint.definition}</p>
                  </div>
                ))
              ) : (
                <p>Sorry 😔. No hints available for this word</p>
              )}
            </div>
          )}
        </div>

        <div className="relative ml-auto mt-6 mr-6 w-fit rounded-lg p-3 flex flex-row items-center gap-x-3 bg-secondary">
          <p className="font-bold">Level {userStats.level}</p>
          <div className="flex flex-row items-center gap-x-2 font-bold">
            <img src={coinsImage} alt="Coins" />
            <p>{userStats.points}</p>
          </div>
          {success && <div className="absolute top-full right-3 text-yellow-500 font-bold animate-up"> + {userStats.currentPoints}</div>}
        </div>
      </div>
      <main className="flex flex-col items-center justify-center gap-y-6 ml-auto mr-auto w-fit grow p-6">
        {!incorrect ? (
          <button
            onClick={__init__}
            className="flex flex-row items-center justify-center w-20 h-20 rounded-full bg-secondary shadow-speakerShadow hover:w-24 hover:h-24  hover:shadow-speakerShadowEnhanced hover:cursor-pointer my-2 hover:bg-secondary transition-width duration-300"
          >
            <FaUndo className="text-5xl" />
          </button>
        ) : (
          <button
            onClick={playAudio}
            className="flex flex-row items-center justify-center w-20 h-20 rounded-full bg-secondary shadow-speakerShadow hover:w-24 hover:h-24  hover:shadow-speakerShadowEnhanced hover:cursor-pointer my-2 hover:bg-secondary transition-width duration-300"
          >
            <FaVolumeUp className="text-5xl" />
          </button>
        )}
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col justify-center items-center max-w-full gap-y-3 mb-4">
          <div className="flex flex-row justify-center items-center gap-x-3 mb-6">
            {wordDetails.wordarr.map((item, index) => (
              <input
                ref={index === 0 ? firstInput : null}
                type="text"
                onKeyUp={(e) => updateWord(e, index)}
                data-id={index}
                key={index}
                maxLength="1"
                disabled={false}
                className="w-20 h-20 bg-accent focus:bg-green-500 rounded-lg text-[#1A1F16] uppercase text-4xl font-bold text-center focus:outline-none"
              />
            ))}
          </div>
          {message}
          {incorrect ? (
            <button id="submitBtn" onClick={matchWord} className="transition duration-300 rounded-lg px-6 py-2 hover:bg-green-400 bg-green-500 font-bold">
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
        {userStats.attempts ? (
          <div className="mt-auto bg-secondary text-white px-3 py-2 rounded-lg w-fit font-bold text-center shadow-2xl hover:cursor-pointer">
            {incorrect ? (
              <>
                <span className={`px-3 py-1 ${userStats.attempts === 3 ? "bg-green-500" : userStats.attempts === 2 ? "bg-yellow-500" : "bg-red-500"} rounded-lg mr-3 transition duration-300`}>
                  {userStats.attempts}
                </span>{" "}
                attempts left
              </>
            ) : (
              <>
                You took
                <span className={`px-3 py-1 ${userStats.attempts === 3 ? "bg-green-500" : userStats.attempts === 2 ? "bg-yellow-500" : "bg-red-500"} rounded-lg mx-3 transition duration-300`}>
                  {4 - userStats.attempts}
                </span>
                attempt{4 - userStats.attempts === 1 ? "" : "s"}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="animate-check flex flex-row items-center justify-center bg-red-800 w-10 h-10 rounded-full">
              <img src={cross} alt="cross" />
            </div>
            <div className="mt-auto text-2xl animate-error">
              The word was <span className="bg-red-500 rounded-lg px-3 py-2 text-white font-bold">{wordDetails.word}</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
