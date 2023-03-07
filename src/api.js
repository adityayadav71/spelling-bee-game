export const fetchWordDetails = async (word) => {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  const data = await res.json();
  const audioFiles = data[0].phonetics.filter((phonetic) => phonetic.audio !== "");
  return audioFiles[0].audio;
};
