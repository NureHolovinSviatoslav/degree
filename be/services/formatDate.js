function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();

  // getMonth() returns 0-based month, so add 1 to get the correct month
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

module.exports = {
  formatDateToYYYYMMDD,
};
