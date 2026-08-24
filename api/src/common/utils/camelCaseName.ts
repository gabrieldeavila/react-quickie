export function camelCase(str: string, capitalizeFirstLetter?: boolean) {
  const words = str.split(' ');
  const camelCaseWords = words.map((word, index) => {
    if (index === 0 && capitalizeFirstLetter) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else if (index === 0) {
      return word.toLowerCase();
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  });
  return camelCaseWords.join('');
}
