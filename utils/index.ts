import { format, formatDistanceToNow, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class name utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: Date | Timestamp, formatStr = 'MMM dd, yyyy'): string {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return format(jsDate, formatStr);
}

export function formatDateTime(date: Date | Timestamp): string {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return format(jsDate, 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: Date | Timestamp): string {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return formatDistanceToNow(jsDate, { addSuffix: true });
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
}

// Currency formatting
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Markdown formatting utilities
export function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold markers
    .replace(/^#+\s*/gm, '') // Remove # headers
    .replace(/^[-•*]\s*/gm, '• ') // Normalize bullet points
    .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    .trim();
}

export function cleanMarkdownPreview(text: string, maxLength: number = 100): string {
  return cleanMarkdown(text).substring(0, maxLength) + (text.length > maxLength ? '...' : '');
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Array utilities
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// Object utilities
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

// Campaign performance utilities
export function getPerformanceStatus(
  metric: number,
  benchmarks: { excellent: number; good: number; average: number }
): 'excellent' | 'good' | 'average' | 'poor' {
  if (metric >= benchmarks.excellent) return 'excellent';
  if (metric >= benchmarks.good) return 'good';
  if (metric >= benchmarks.average) return 'average';
  return 'poor';
}

export function calculateROAS(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return revenue / spend;
}

export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

export function calculateCPC(spend: number, clicks: number): number {
  if (clicks === 0) return 0;
  return spend / clicks;
}

export function calculateCPM(spend: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (spend / impressions) * 1000;
}

// Budget utilities
export function allocateBudget(
  totalBudget: number,
  allocations: { platform: string; percentage: number }[]
): { platform: string; amount: number; dailyBudget: number }[] {
  return allocations.map(allocation => ({
    platform: allocation.platform,
    amount: (totalBudget * allocation.percentage) / 100,
    dailyBudget: (totalBudget * allocation.percentage) / 100 / 30 // Assuming 30-day campaign
  }));
}

// Color utilities for charts and status indicators
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    paused: 'text-gray-600 bg-gray-100',
    completed: 'text-blue-600 bg-blue-100',
    cancelled: 'text-red-600 bg-red-100',
    error: 'text-red-600 bg-red-100',
    draft: 'text-gray-600 bg-gray-100',
    approved: 'text-green-600 bg-green-100',
    excellent: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    average: 'text-yellow-600 bg-yellow-100',
    poor: 'text-red-600 bg-red-100'
  };
  
  return colors[status] || 'text-gray-600 bg-gray-100';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    meta: '#1877F2',
    facebook: '#1877F2',
    instagram: '#E4405F',
    google: '#4285F4',
    whatsapp: '#25D366'
  };
  
  return colors[platform] || '#6B7280';
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Error handling utilities
export function getErrorMessage(error: any): string {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

export function logError(error: any, context?: string): void {
  console.error(context ? `[${context}]` : '[Error]', error);
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (e.g., Sentry, LogRocket)
  }
}

// API utilities
export function createApiUrl(endpoint: string, params?: Record<string, any>): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = new URL(endpoint, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// Business logic utilities
export function generateCampaignName(businessName: string, platform: string, objective: string): string {
  const date = format(new Date(), 'MMM-yyyy');
  return `${businessName} - ${capitalize(platform)} ${capitalize(objective)} - ${date}`;
}

export function calculateOptimalBudgetSplit(
  totalBudget: number,
  platforms: string[],
  businessType: string
): Record<string, number> {
  // Default allocations based on business type
  const allocations: Record<string, Record<string, number>> = {
    restaurant: { meta: 40, google: 35, whatsapp: 25 },
    retail: { meta: 50, google: 30, whatsapp: 20 },
    service: { meta: 35, google: 45, whatsapp: 20 },
    ecommerce: { meta: 45, google: 40, whatsapp: 15 },
    default: { meta: 40, google: 35, whatsapp: 25 }
  };
  
  const businessAllocations = allocations[businessType] || allocations.default;
  const result: Record<string, number> = {};
  
  platforms.forEach(platform => {
    const percentage = businessAllocations[platform] || 0;
    result[platform] = (totalBudget * percentage) / 100;
  });
  
  return result;
}

export default {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  isValidEmail,
  isValidPhone,
  isValidURL,
  capitalize,
  slugify,
  truncate,
  generateId,
  groupBy,
  sortBy,
  unique,
  pick,
  omit,
  getPerformanceStatus,
  calculateROAS,
  calculateCTR,
  calculateCPC,
  calculateCPM,
  getStatusColor,
  getPlatformColor,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  debounce,
  throttle,
  getErrorMessage,
  logError,
  createApiUrl,
  formatFileSize,
  getFileExtension,
  generateCampaignName,
  calculateOptimalBudgetSplit
}; 