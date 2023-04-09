export const fetchWordDetails = async (word) => {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  const data = await res.json();
  const hints = data[0]?.meanings?.map((meaning) => {
    return {
      definition: meaning.definitions.filter((def) => {
        const definition = def.definition.split(" ").map((word) => word.toLowerCase());
        return !definition.includes(word.toLowerCase());
      })[0].definition,
      partOfSpeech: meaning.partOfSpeech,
    };
  });
  const audioFiles = data[0]?.phonetics?.filter((phonetic) => phonetic.audio !== "");
  return { audio: audioFiles[0]?.audio, hints };
};
