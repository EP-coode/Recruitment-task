export const parsePage = (page: string | null, min = 1, defaultPage = 1) => {
  if (!page) {
    return defaultPage;
  }

  const parsedPage = parseInt(page);

  if (isNaN(parsedPage)) {
    return defaultPage;
  }

  if (parsedPage < min) {
    return min;
  }

  return parsedPage;
};
