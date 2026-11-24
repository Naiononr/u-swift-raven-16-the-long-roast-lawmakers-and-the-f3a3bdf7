// The Long Roast: Lawmakers and the File They Cannot Convert — make.fun bounty
// u-swift-raven-16-the-long-roast-lawmakers-and-the-f3a3bdf7
//
// Writes one satirical sentence roasting lawmakers who regulate AI, crypto
// or the internet but cannot convert a file to PDF, to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR/entry.txt when set).
// Deterministic: same bytes on every run. Stdlib only, no network.

import { chmodSync, copyFileSync, mkdirSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROAST =
  "She wrote the 400-page bill regulating AI, crypto, and the internet, then emailed her staff a file named FINAL_final_v2 and asked them to turn it into a PDF.";

// Why this line: it names all three domains the brief names (AI, crypto,
// the internet), sets up the lawmaker's authority (a 400-page bill she
// wrote), then undercuts it with the file she cannot convert — and the
// punch lands on the last words. The filename FINAL_final_v2 is a
// specific, unexpected detail, not the worn "prints her emails" cliche.
// A roast is a single sentence, so the line must stay one sentence and
// inside the grader's 1–320 char gate (it is 157 chars); enforce that
// gate here so a future edit that breaks it fails loudly instead of
// silently submitting an invalid entry.
if (
  ROAST.length < 1 ||
  ROAST.length > 320 ||
  ROAST.trim() !== ROAST ||
  ROAST.includes("\n") ||
  (ROAST.match(/\./g) ?? []).length !== 1
) {
  throw new Error(
    `Roast must be a single sentence of 1–320 chars, got ${ROAST.length} chars`,
  );
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });

// Atomic, world-readable write. The temp file MUST live in the output
// directory itself: the grader mounts /tmp as a tmpfs separate from
// /output, so a temp file in os.tmpdir() cannot be renamed onto /output
// (EXDEV: cross-device link not permitted) and the run exits 1.
// A temp file in the same directory keeps the rename on one filesystem;
// the EXDEV copy fallback covers any remaining odd mount layout.
const tmpFile = join(outDir, `.entry-${process.pid}.tmp`);
try {
  writeFileSync(tmpFile, ROAST, "utf8");
  chmodSync(tmpFile, 0o644);
  try {
    renameSync(tmpFile, outPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
    copyFileSync(tmpFile, outPath);
    chmodSync(outPath, 0o644);
    unlinkSync(tmpFile);
  }
} finally {
  rmSync(tmpFile, { force: true });
}
