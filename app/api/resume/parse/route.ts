import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { extractText, getDocumentProxy } from 'unpdf';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No resume file was provided. Please select a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'resume';
    const lowerName = fileName.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx =
      lowerName.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        {
          error:
            'Unsupported file format. Please upload a valid .pdf or .docx resume document.',
        },
        { status: 415 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'The uploaded file is empty (0 bytes). Please upload a valid resume.' },
        { status: 422 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File exceeds the 10 MB upload limit. Please compress or upload a smaller resume.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isPdf) {
      try {
        const pdfProxy = await getDocumentProxy(new Uint8Array(arrayBuffer));
        const { totalPages, text } = await extractText(pdfProxy, { mergePages: true });
        const cleanedText = String(text ?? '').trim();

        if (!cleanedText || cleanedText.length < 25) {
          return NextResponse.json(
            {
              error:
                'No readable text could be extracted from this PDF. It may be a scanned image-only PDF. Please export a text-selectable PDF or upload a .docx version.',
            },
            { status: 422 }
          );
        }

        return NextResponse.json({
          fileName,
          fileType: 'pdf' as const,
          fileSize: file.size,
          pageCount: totalPages,
          extractedText: cleanedText.slice(0, 95000),
        });
      } catch (pdfErr) {
        const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
        const lowerMsg = msg.toLowerCase();
        if (
          lowerMsg.includes('password') ||
          lowerMsg.includes('encrypted') ||
          lowerMsg.includes('need a password')
        ) {
          return NextResponse.json(
            {
              error:
                'This PDF is password-protected or encrypted. Please unlock or export an unencrypted PDF before uploading.',
            },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            error:
              'Unable to read this PDF file. It may be corrupted or malformed. Try re-exporting it as a standard PDF or DOCX.',
          },
          { status: 422 }
        );
      }
    }

    // DOCX extraction via mammoth
    try {
      const result = await mammoth.extractRawText({ buffer });
      const cleanedText = (result.value || '').trim();
      if (!cleanedText || cleanedText.length < 25) {
        return NextResponse.json(
          {
            error:
              'The uploaded DOCX file contains no readable text content. Please check the file and try again.',
          },
          { status: 422 }
        );
      }

      return NextResponse.json({
        fileName,
        fileType: 'docx' as const,
        fileSize: file.size,
        pageCount: 1,
        extractedText: cleanedText.slice(0, 95000),
      });
    } catch {
      return NextResponse.json(
        {
          error:
            'Unable to parse this DOCX file. Ensure it is a genuine Word .docx document (legacy .doc binary files are not supported).',
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('Resume parse error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error while reading the resume file.' },
      { status: 500 }
    );
  }
}
