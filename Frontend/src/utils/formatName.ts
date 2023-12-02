/**
 * Format a given name by capitalizing the first letter of each word.
 * Handles hyphenated words by capitalizing the first letter after each hyphen.
 *
 * @param {string} name - The input name to be formatted.
 * @returns {string} The formatted name.
 */
export const formatName = (name: string) => {
    return name
        .split(/\s+/)
        .map((word) => {
            const hyphenIndex = word.indexOf('-');
            if (hyphenIndex !== -1) {
                const firstPart = word.slice(0, hyphenIndex + 1);
                const restOfWord = word.slice(hyphenIndex + 1).charAt(0).toUpperCase() + word.slice(hyphenIndex + 2).toLowerCase();
                return `${firstPart}${restOfWord}`;
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        })
        .join(' ');
};