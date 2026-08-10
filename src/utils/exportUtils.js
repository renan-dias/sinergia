import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

/**
 * EXPORT TO PDF (Parecer Pedagógico ou Relatório de Desempenho)
 */
export const exportToPDF = ({ title, subtitle, contentText, tableHeaders, tableRows, filename = 'relatorio_sinergia.pdf' }) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(0, 107, 31); // Brand Green #006b1f
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SinergIA — Relatório Pedagógico EPT', 14, 16);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 38);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 45);
  }

  let yPosition = subtitle ? 55 : 48;

  if (contentText) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const splitText = doc.splitTextToSize(contentText, 180);
    doc.text(splitText, 14, yPosition);
    yPosition += splitText.length * 6 + 10;
  }

  if (tableHeaders && tableRows) {
    doc.autoTable({
      startY: yPosition,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 107, 31], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 }
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`SinergIA SIG-EPT — Documento Pedagógico Gerado em ${new Date().toLocaleDateString('pt-BR')} — Página ${i} de ${pageCount}`, 14, 285);
  }

  doc.save(filename);
};

/**
 * EXPORT TO EXCEL / XLSX
 */
export const exportToExcel = (dataArray, filename = 'dados_sinergia.xlsx', sheetName = 'Dados') => {
  const worksheet = XLSX.utils.json_to_sheet(dataArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

/**
 * EXPORT TO WORD / DOCX (Parecer Pedagógico Formatado)
 */
export const exportToWord = async ({ title, sinteseGeral, padroesColetivos, alunosAtencao, sugestoes, filename = 'parecer_pedagogico.docx' }) => {
  const children = [
    new Paragraph({
      text: "SinergIA — Sistema de Informação Gerencial EPT",
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 }
    }),
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "1. Síntese Geral da Turma", bold: true, size: 24, color: "006B1F" })
      ],
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: sinteseGeral || "Sem dados.",
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "2. Padrões Coletivos Identificados", bold: true, size: 24, color: "006B1F" })
      ],
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: padroesColetivos || "Sem dados.",
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "3. Sugestões de Encaminhamento Pedagógico", bold: true, size: 24, color: "006B1F" })
      ],
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: sugestoes || "Sem dados.",
      spacing: { after: 200 }
    })
  ];

  if (alunosAtencao && alunosAtencao.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "4. Estudantes em Acompanhamento e Recuperação", bold: true, size: 24, color: "BC0009" })
        ],
        spacing: { before: 200, after: 100 }
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Estudante", bold: true })], width: { size: 30, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: "Desafio Identificado", bold: true })], width: { size: 40, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: "Recomendação", bold: true })], width: { size: 30, type: WidthType.PERCENTAGE } }),
        ]
      })
    ];

    alunosAtencao.forEach(item => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.identificador || item.aluno_nome || "Aluno")] }),
            new TableCell({ children: [new Paragraph(item.motivo || "")] }),
            new TableCell({ children: [new Paragraph(item.recomendacao || "")] }),
          ]
        })
      );
    });

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};
