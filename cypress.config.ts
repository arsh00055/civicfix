import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: true,

  env: {
    CITIZEN_EMAIL: process.env.CYPRESS_CITIZEN_EMAIL,
    CITIZEN_PASSWORD: process.env.CYPRESS_CITIZEN_PASSWORD,
    VOLUNTEER_EMAIL: process.env.CYPRESS_VOLUNTEER_EMAIL,
    VOLUNTEER_PASSWORD: process.env.CYPRESS_VOLUNTEER_PASSWORD,
    ADMIN_EMAIL: process.env.CYPRESS_ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.CYPRESS_ADMIN_PASSWORD,
  },

  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
