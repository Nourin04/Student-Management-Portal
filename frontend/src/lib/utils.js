/**
 * Capitalizes the first letter of each word in a full name.
 * Example: "john doe" -> "John Doe"
 */
export const formatName = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Capitalizes the first letter of a subject string.
 * Example: "math" -> "Math"
 */
export const formatSubject = (subject) => {
  if (!subject) return '';
  return subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
};
