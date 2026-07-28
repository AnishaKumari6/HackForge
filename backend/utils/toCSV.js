/**
 * Converts an array of flat objects into CSV text.
 * Minimal dependency-free implementation — sufficient for export features
 * like "Export Registrations to CSV".
 */
const toCSV = (rows, columns) => {
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escape(c.value(row))).join(","));

  return [header, ...lines].join("\n");
};

module.exports = toCSV;
