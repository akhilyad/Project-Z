/**
 * Parse PDF and DOCX files into plain text.
 */

export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    return parsePDF(buffer);
  } else if (ext === "docx" || ext === "doc") {
    return parseDOCX(buffer);
  } else if (ext === "txt") {
    return buffer.toString("utf-8");
  }

  throw new Error(
    `Unsupported file type: .${ext}. Please upload a PDF, DOCX, or TXT file.`
  );
}

async function parsePDF(buffer: Buffer): Promise<string> {
  // Use the v2 API exported by pdf-parse
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const data = await parser.getText();
    return data.text || "";
  } finally {
    await parser.destroy();
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
