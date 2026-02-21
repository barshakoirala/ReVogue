export function health(_, res) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}
