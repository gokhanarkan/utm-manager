// Clear cookies before each test
beforeEach(() => {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  // Mock console.error to avoid noise
  console.error = jest.fn();
});

test("setup file is loaded", () => {
  expect(true).toBe(true);
});
