export const MAP_CONFIG = {
  DEFAULT_CENTER: [30.708335, 76.690041] as [number, number],
  DEFAULT_ZOOM: 13,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const SEARCH = {
  DEBOUNCE_DELAY: 300,
  MIN_QUERY_LENGTH: 2,
};

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export const NOTIFICATION = {
  AUTO_HIDE_DELAY: 5000,
  MAX_VISIBLE: 5,
};

export const PERFORMANCE = {
  LAZY_LOAD_THRESHOLD: 100,
  INFINITE_SCROLL_THRESHOLD: 200,
};