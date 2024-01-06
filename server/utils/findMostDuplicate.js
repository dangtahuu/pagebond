function findMostDuplicates(arr, num) {
    // Create an object to store the count of each element
    const countMap = {};
    
    // Iterate through the array and count occurrences of each element
    arr.forEach((item) => {
      countMap[item] = (countMap[item] || 0) + 1;
    });
    
    // Convert the countMap object to an array of objects with 'value' and 'count'
    const countArray = Object.entries(countMap).map(([value, count]) => ({ value, count }));
  
    // Sort the countArray in descending order based on the count
    countArray.sort((a, b) => b.count - a.count);
  
    // Take the first three elements from the sorted array
    return countArray.slice(0, num);
  
}

export default findMostDuplicates