import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // ── Handle @/ path aliases ───────────────────────────────────────────────
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|ico)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // ── Transform ────────────────────────────────────────────────────────────
  // By default Jest ignores node_modules. BUT bson, mongodb, and several
  // other packages ship as ESM (.mjs) which CommonJS Jest can't parse.
  // We must explicitly tell Jest to transform them.
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
    // Transform ESM packages from node_modules using babel-jest
    '^.+\\.(js|mjs|cjs)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
      ],
    }],
  },

  // ── transformIgnorePatterns ───────────────────────────────────────────────
  // This is the key fix.
  // Default is: ["/node_modules/"] — which ignores ALL node_modules.
  // We override it to ALLOW transformation of ESM-only packages.
  // Everything NOT in this list gets transformed.
  transformIgnorePatterns: [
    '/node_modules/(?!' + [
      'bson',           // ← the direct cause of your error
      'mongodb',        // ← imports bson
      'mongodb-connection-string-url',
      'whatwg-url',     // ← mongodb peer dep, also ESM
      'tr46',           // ← whatwg-url dep
      'webidl-conversions', // ← whatwg-url dep
    ].join('|') + ')',
  ],

  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/?(*.)+(test|spec).(ts|tsx)',
  ],

  // ── Module file extensions ────────────────────────────────────────────────
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json'],
};

export default config;