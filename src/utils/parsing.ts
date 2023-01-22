export const parsePage = (
  rawPageNumber: string | null,
  min = 1,
  defaultPage = 1
) => {
  if (!rawPageNumber) {
    return defaultPage;
  }

  const parsedPage = parseInt(rawPageNumber);

  if (isNaN(parsedPage)) {
    return defaultPage;
  }

  if (parsedPage < min) {
    return min;
  }

  return parsedPage;
};

const natuaralNumWithoutLeadingZeros = new RegExp("^([1-9][0-9]*)$", "gm");

export const isValidId = (rawNumber: string): boolean => {
  const match = rawNumber.match(natuaralNumWithoutLeadingZeros);

  if (match) {
    return true;
  }

  return false;
};
