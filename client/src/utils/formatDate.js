const formatDate = (time) => {
  const date = new Date(time);
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return `${dd >= 10 ? dd : "0" + dd}-${mm >= 10 ? mm : "0" + mm}-${yyyy}`;
};

export default formatDate