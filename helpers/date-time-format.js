function formatDate(date) {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Use AM/PM
    };
  
    return date.toLocaleDateString('en-US', options);
  }
  
module.exports = { formatDate };
