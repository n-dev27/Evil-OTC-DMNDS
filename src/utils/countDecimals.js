  export function countLeadingZerosAfterDecimal(num) {
    let afterDecimal = num.toString().split(".")[1];

    // Count leading zeros only if there is a fractional part
    if (afterDecimal) {
      let count = 0;
      for (let i = 0; i < afterDecimal.length; i++) {
        if (afterDecimal[i] === "0") {
          count++;
        } else {
          break; // if it encounters a non-zero, break the loop
        }
      }

      return parseFloat(num).toFixed(count >= 3 ? 4 : count + 2);
    }

    // Return 0 if no fractional part
    return num;
  }