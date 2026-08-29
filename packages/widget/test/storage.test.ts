import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getLocalLastReadAt, setLocalLastReadAt } from "../src/storage.js";

const realLocalStorage = window.localStorage;

function replaceLocalStorageWith(fake: Pick<Storage, "getItem" | "setItem">) {
  Object.defineProperty(window, "localStorage", { value: fake, configurable: true });
}

describe("storage", () => {
  beforeEach(() => {
    replaceLocalStorageWith(realLocalStorage);
    realLocalStorage.clear();
  });

  afterEach(() => {
    replaceLocalStorageWith(realLocalStorage);
  });

  it("round-trips a value through localStorage", () => {
    setLocalLastReadAt("2026-01-01T00:00:00Z");
    expect(getLocalLastReadAt()).toBe("2026-01-01T00:00:00Z");
  });

  it("returns null instead of throwing when localStorage.getItem throws", () => {
    replaceLocalStorageWith({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: realLocalStorage.setItem.bind(realLocalStorage),
    });
    expect(getLocalLastReadAt()).toBeNull();
  });

  it("does not throw when localStorage.setItem throws", () => {
    replaceLocalStorageWith({
      getItem: realLocalStorage.getItem.bind(realLocalStorage),
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => setLocalLastReadAt("2026-01-01T00:00:00Z")).not.toThrow();
  });
});
