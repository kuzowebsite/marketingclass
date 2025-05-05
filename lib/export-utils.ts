import saveAs from "file-saver"
import type { Note } from "@/lib/types"

// PDF экспортын функц
export async function exportToPDF(notes: Note[], fileName = "notes") {
  // jsPDF санг динамикаар импортлох
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()

  let yPosition = 20
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const lineHeight = 7

  notes.forEach((note, index) => {
    // Хуудас дүүрсэн эсэхийг шалгах
    if (yPosition > pageHeight - margin) {
      doc.addPage()
      yPosition = 20
    }

    // Тэмдэглэлийн гарчиг
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(note.title, margin, yPosition)
    yPosition += lineHeight + 3

    // Тэмдэглэлийн огноо
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.text(
      `Үүсгэсэн: ${new Date(note.createdAt).toLocaleDateString()} | Шинэчилсэн: ${new Date(
        note.updatedAt,
      ).toLocaleDateString()}`,
      margin,
      yPosition,
    )
    yPosition += lineHeight

    // Тэмдэглэлийн агуулга
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    // Текстийг мөр мөрөөр салгах
    const textLines = doc.splitTextToSize(note.text, doc.internal.pageSize.width - 2 * margin)

    // Текст хуудсанд багтах эсэхийг шалгах
    if (yPosition + textLines.length * lineHeight > pageHeight - margin) {
      const linesCanFit = Math.floor((pageHeight - margin - yPosition) / lineHeight)

      // Багтах хэсгийг хуудсанд нэмэх
      doc.text(textLines.slice(0, linesCanFit), margin, yPosition)

      // Шинэ хуудас нэмэх
      doc.addPage()
      yPosition = 20

      // Үлдсэн текстийг шинэ хуудсанд нэмэх
      doc.text(textLines.slice(linesCanFit), margin, yPosition)
      yPosition += textLines.slice(linesCanFit).length * lineHeight
    } else {
      doc.text(textLines, margin, yPosition)
      yPosition += textLines.length * lineHeight
    }

    // Тэмдэглэлүүдийн хооронд зай үүсгэх
    yPosition += 10

    // Хэрэв энэ сүүлийн тэмдэглэл биш бол зураас нэмэх
    if (index < notes.length - 1) {
      doc.setDrawColor(200)
      doc.line(margin, yPosition - 5, doc.internal.pageSize.width - margin, yPosition - 5)
      yPosition += 10
    }
  })

  // PDF файлыг татах
  doc.save(`${fileName}.pdf`)
}

// DOCX экспортын функц
export async function exportToDOCX(notes: Note[], fileName = "notes") {
  // docx санг динамикаар импортлох
  const docx = await import("docx")
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, BorderStyle } = docx

  const children: docx.Paragraph[] = []

  notes.forEach((note, index) => {
    // Тэмдэглэлийн гарчиг
    children.push(
      new Paragraph({
        text: note.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 120 },
      }),
    )

    // Тэмдэглэлийн огноо
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Үүсгэсэн: ${new Date(note.createdAt).toLocaleDateString()} | Шинэчилсэн: ${new Date(
              note.updatedAt,
            ).toLocaleDateString()}`,
            italics: true,
            size: 18,
          }),
        ],
        spacing: { after: 200 },
      }),
    )

    // Тэмдэглэлийн агуулга
    const textLines = note.text.split("\n")
    textLines.forEach((line) => {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 120 },
        }),
      )
    })

    // Хэрэв энэ сүүлийн тэмдэглэл биш бол зураас нэмэх
    if (index < notes.length - 1) {
      children.push(
        new Paragraph({
          text: "",
          border: {
            bottom: {
              color: "999999",
              style: BorderStyle.SINGLE,
              size: 1,
            },
          },
          spacing: { before: 300, after: 300 },
        }),
      )
    }
  })

  // Документ үүсгэх
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  // DOCX файл үүсгэх
  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })

  // Файлыг татах
  saveAs(blob, `${fileName}.docx`)
}

// TXT экспортын функц
export function exportToTXT(notes: Note[], fileName = "notes") {
  let content = ""

  notes.forEach((note, index) => {
    // Тэмдэглэлийн гарчиг
    content += `${note.title}\n`

    // Тэмдэглэлийн огноо
    content += `Үүсгэсэн: ${new Date(note.createdAt).toLocaleDateString()} | Шинэчилсэн: ${new Date(
      note.updatedAt,
    ).toLocaleDateString()}\n\n`

    // Тэмдэглэлийн агуулга
    content += `${note.text}\n`

    // Хэрэв энэ сүүлийн тэмдэглэл биш бол зураас нэмэх
    if (index < notes.length - 1) {
      content += "\n----------------------------------------\n\n"
    }
  })

  // TXT файл үүсгэх
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })

  // Файлыг татах
  saveAs(blob, `${fileName}.txt`)
}

// Markdown экспортын функц
export function exportToMarkdown(notes: Note[], fileName = "notes") {
  let content = ""

  notes.forEach((note, index) => {
    // Тэмдэглэлийн гарчиг
    content += `## ${note.title}\n\n`

    // Тэмдэглэлийн огноо
    content += `*Үүсгэсэн: ${new Date(note.createdAt).toLocaleDateString()} | Шинэчилсэн: ${new Date(
      note.updatedAt,
    ).toLocaleDateString()}*\n\n`

    // Тэмдэглэлийн агуулга
    content += `${note.text}\n`

    // Хэрэв энэ сүүлийн тэмдэглэл биш бол зураас нэмэх
    if (index < notes.length - 1) {
      content += "\n---\n\n"
    }
  })

  // Markdown файл үүсгэх
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })

  // Файлыг татах
  saveAs(blob, `${fileName}.md`)
}

// HTML экспортын функц
export function exportToHTML(notes: Note[], fileName = "notes") {
  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Тэмдэглэлүүд</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .note { margin-bottom: 30px; }
        .note-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
        .note-date { font-style: italic; color: #666; margin-bottom: 10px; font-size: 12px; }
        .note-content { white-space: pre-wrap; }
        .note-divider { border-top: 1px solid #ddd; margin: 20px 0; }
      </style>
    </head>
    <body>
  `

  notes.forEach((note, index) => {
    content += `
      <div class="note">
        <div class="note-title">${escapeHtml(note.title)}</div>
        <div class="note-date">
          Үүсгэсэн: ${new Date(note.createdAt).toLocaleDateString()} | 
          Шинэчилсэн: ${new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div class="note-content">${escapeHtml(note.text)}</div>
      </div>
    `

    // Хэрэв энэ сүүлийн тэмдэглэл биш бол зураас нэмэх
    if (index < notes.length - 1) {
      content += `<div class="note-divider"></div>`
    }
  })

  content += `
    </body>
    </html>
  `

  // HTML файл үүсгэх
  const blob = new Blob([content], { type: "text/html;charset=utf-8" })

  // Файлыг татах
  saveAs(blob, `${fileName}.html`)
}

// HTML escape функц
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>")
}
