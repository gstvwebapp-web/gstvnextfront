export function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);

  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return "હમણાં જ";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} મિનિટ પહેલા`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} કલાક પહેલા`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} દિવસ પહેલા`;

  // 👉 NEW: Week logic
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} અઠવાડિયા પહેલા`; // Gujarati for weeks

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} મહિના પહેલા`;

  const years = Math.floor(months / 12);
  return `${years} વર્ષ પહેલા`;
}