export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatTime = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

export const formatCategory = (category: string): string => {
  const categories: Record<string, string> = {
    'COFFEE': 'Kopi',
    'NON_COFFEE': 'Non Kopi',
    'FOOD': 'Makanan',
    'SNACK': 'Cemilan'
  };
  return categories[category] || category;
};

export const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    'CASH': 'Tunai',
    'QRIS': 'QRIS',
    'DEBIT': 'Debit',
    'CREDIT': 'Kartu Kredit'
  };
  return methods[method] || method;
};
