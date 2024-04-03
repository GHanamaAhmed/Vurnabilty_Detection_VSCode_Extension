function parseBearerOutput(data) {
  const sections = data.split(/\n\s*(?=HIGH:|MEDIUM:|LOW:|WARNING:)/);
  const report = { HIGH: [], MEDIUM: [], LOW: [], WARNING: [] };

  const issus = sections.map((section) => {
    const lines = section.split("\n").filter((line) => line.trim() !== "");
    const type = lines?.[0]?.split(":")?.[0];
    const name = lines?.[0]?.split(":")?.[1]?.split("[")?.[0]?.trim();
    const link = lines?.[0]?.split(":")?.[2];
    const file = lines?.[0]?.split(":")?.[4];
    let places = [];
    for (let index = 5; index < lines.length; index++) {
      places.push(lines[index]);
    }
    return { type, name, link, file, places };
  });
  issus.forEach((e) => {
    if (e.type === "HIGH") {
      report.HIGH.push(e);
    } else if (e.type === "MEDIUM") {
      report.MEDIUM.push(e);
    } else if (e.type === "LOW") {
      report.LOW.push(e);
    } else if (e.type === "WARNING") {
      report.WARNING.push(e);
    }
  });
  return report;
}
module.exports = { parseBearerOutput };
