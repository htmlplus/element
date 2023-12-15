/**
  Determines whether the given input string is a valid 
  [CSS Color](https://developer.mozilla.org/docs/Web/CSS/color_value) 
  or not.
  
  @example

  ```js
  isCSSColor('red')                       // true
  isCSSColor('#ff0000')                   // true
  isCSSColor('#ff000080')                 // true
  isCSSColor('rgb(255, 0, 0)')            // true
  isCSSColor('rgba(255, 0, 0, 0.3)')      // true
  isCSSColor('hsl(120, 100%, 50%)')       // true
  isCSSColor('hsla(120, 100%, 50%, 0.3)') // true
  isCSSColor('invalid color')             // false
  ```
*/
export const isCSSColor = (input: string): boolean => {
  const option = new Option();
  option.style.color = input;
  return option.style.color !== '';
};
