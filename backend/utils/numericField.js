const normalizeNumeric = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    return Number(value);
};

const isNonNegativeOrNull = (value) =>
    value === null || (typeof value === "number" && !Number.isNaN(value) && value >= 0);

module.exports = { normalizeNumeric, isNonNegativeOrNull };
