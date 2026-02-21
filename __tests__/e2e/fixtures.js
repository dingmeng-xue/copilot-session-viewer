// __tests__/e2e/fixtures.js
const playwright = require('@playwright/test');

const test = playwright.test;

module.exports = {
  test,
  expect: playwright.expect
};
