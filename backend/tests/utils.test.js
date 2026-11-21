const { isValidId } = require("../utils/validateId");
const { normalizeNumeric, isNonNegativeOrNull } = require("../utils/numericField");

describe("isValidId", () => {
    test.each([1, "1", "42", 1000])("accepts %p", (value) => {
        expect(isValidId(value)).toBe(true);
    });

    test.each(["", "abc", "-1", "1.5", "1; DROP TABLE users", " 1", null, undefined])(
        "rejects %p",
        (value) => {
            expect(isValidId(value)).toBe(false);
        }
    );
});

describe("normalizeNumeric", () => {
    test.each([undefined, null, ""])("maps %p to null", (value) => {
        expect(normalizeNumeric(value)).toBeNull();
    });

    test("converts numeric strings", () => {
        expect(normalizeNumeric("12.5")).toBe(12.5);
        expect(normalizeNumeric(0)).toBe(0);
    });

    test("turns garbage into NaN", () => {
        expect(normalizeNumeric("abc")).toBeNaN();
    });
});

describe("isNonNegativeOrNull", () => {
    test.each([null, 0, 10, 99.99])("accepts %p", (value) => {
        expect(isNonNegativeOrNull(value)).toBe(true);
    });

    test.each([-1, NaN, "5", undefined])("rejects %p", (value) => {
        expect(isNonNegativeOrNull(value)).toBe(false);
    });
});
