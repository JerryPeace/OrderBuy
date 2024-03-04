const formatPrice = (x: number): string => {
  const fixed = x.toFixed(1);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const formatNumber = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};


const formator = { formatNumber, formatPrice };

export default formator;
