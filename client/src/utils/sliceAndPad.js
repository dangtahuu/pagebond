function sliceAndPad(array, length) {
    // Use slice to get the original elements
    const result = array.slice(0, length);
  
    // Pad the result array with empty strings if needed
    for (let i = result.length; i < length; i++) {
      result.push("");
    }
  
    return result;
  }

export default sliceAndPad