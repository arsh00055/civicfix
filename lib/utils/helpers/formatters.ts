// In lib/utils/helpers/formatters.ts

export const formatDate = (date: string | Date | null | undefined): string => {
  // ✅ Add defensive check at the beginning
  if (!date) {
    return 'Date not available';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // ✅ Check if dateObj is valid before calling getTime
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  // Your existing formatting logic here
  // For example:
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(target.getTime())) {
      return 'Invalid date';
    }

    const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

    if (diffInSeconds < 0) {
      return 'In the future';
    }

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }

    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return formatDate(date);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toString();
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  return phone;
};

export const truncateText = (text: string, maxLength: number, ellipsis: string = '...'): string => {
  if (!text || text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}${ellipsis}`;
};

export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const slugify = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
};

export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};