// API Configuration
// IMPORTANT: Update this IP address to your computer's local IP when testing on physical device
// To find your IP: Run 'ipconfig getifaddr en0' on Mac or 'ipconfig' on Windows
export const API_BASE_URL = 'http://localhost:5001/api';

// For testing on physical device, use your computer's IP address:
// export const API_BASE_URL = 'http://192.168.0.105:5001/api';

// For Android Emulator:
// export const API_BASE_URL = 'http://10.0.2.2:5001/api';

export const APP_NAME = 'Goaldah United';
export const APP_VERSION = '1.0.0';

// AsyncStorage Keys
export const STORAGE_KEYS = {
    TOKEN: '@goaldah_token',
    USER: '@goaldah_user',
};

// Event Types
export const EVENT_TYPES = {
    MEETING: 'meeting',
    SPORTS: 'sports',
    SOCIAL: 'social',
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    MEMBER: 'member',
};

// User Status
export const USER_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
};

// Payment Methods
export const PAYMENT_METHODS = {
    CASH: 'cash',
    BKASH: 'bkash',
    NAGAD: 'nagad',
    BANK: 'bank',
};
