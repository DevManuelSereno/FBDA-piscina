import { describe, expect, test } from "vitest";
import { formatTime, parseTime } from "./time";

describe("formatTime", () => {
  test("formats zero as 00:00.00", () => {
    expect(formatTime(0)).toBe("00:00.00");
  });

  test("formats centiseconds under a minute", () => {
    expect(formatTime(4500)).toBe("00:45.00");
  });

  test("formats centiseconds with minutes", () => {
    // 1 min 23.45s = 83.45s = 8345 centiseconds
    expect(formatTime(8345)).toBe("01:23.45");
  });

  test("pads minutes above 9 without truncating", () => {
    // 12 min 05.06s = 725.06s = 72506 centiseconds
    expect(formatTime(72506)).toBe("12:05.06");
  });

  test("throws on negative values", () => {
    expect(() => formatTime(-1)).toThrow();
  });

  test("throws on non-integer values", () => {
    expect(() => formatTime(10.5)).toThrow();
  });
});

describe("parseTime", () => {
  test("parses mm:ss.cc into centiseconds", () => {
    expect(parseTime("01:23.45")).toBe(8345);
  });

  test("parses seconds-only input without minutes", () => {
    expect(parseTime("45.00")).toBe(4500);
  });

  test("parses single-digit minutes", () => {
    expect(parseTime("1:05.00")).toBe(6500);
  });

  test("throws on malformed input", () => {
    expect(() => parseTime("abc")).toThrow();
  });

  test("throws when seconds are 60 or above", () => {
    expect(() => parseTime("12:60.00")).toThrow();
  });

  test("throws when centiseconds have wrong digit count", () => {
    expect(() => parseTime("12:34.5")).toThrow();
    expect(() => parseTime("12:34.567")).toThrow();
  });
});

describe("round trip", () => {
  test("parseTime(formatTime(x)) === x", () => {
    for (const value of [0, 4500, 8345, 72506, 100]) {
      expect(parseTime(formatTime(value))).toBe(value);
    }
  });
});
