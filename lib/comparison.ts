export type Currency = "KZT" | "RUB" | "USD" | "EUR";
export type Comparison = { name: string; amount: number; currency: Currency };
export function comparisonStats(
  price: { amount: number | null; currency: Currency | null },
  comparisons: Comparison[],
) {
  const courses = comparisons.filter(
    (course) =>
      course.currency === price.currency &&
      Number.isFinite(course.amount) &&
      course.amount >= 0,
  );
  const values = courses.map((course) => course.amount).sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  const median = !values.length
    ? null
    : values.length % 2
      ? values[middle]
      : (values[middle - 1] + values[middle]) / 2;
  return {
    courses,
    median,
    difference:
      price.amount !== null && median !== null && median > 0
        ? ((price.amount - median) / median) * 100
        : null,
  };
}
