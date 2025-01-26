import ky from "ky";

/**
 * Parsing strings into dates.
 */
const kyInstance = ky.create({
  parseJson(text: string): any {
    return JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value);
      return value;
    });
  },
});

export default kyInstance;
