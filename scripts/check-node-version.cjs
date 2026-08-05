const major = Number.parseInt(process.versions.node.split(".")[0], 10);

if (major < 18 || major >= 23) {
  console.error(
    `Unsupported Node.js ${process.version}. This project uses Next.js 14 and must run on Node 18, 20, or 22.`
  );
  console.error("Install/use Node 20, then run the command again.");
  process.exit(1);
}
