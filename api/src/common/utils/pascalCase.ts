const pascalName = (str: string = '') => {
  const arr = str.split(/[-_\s]+/);
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    result += arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return result;
};

export default pascalName;
