import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cleanName } from "./signatureUtils";

export interface PdfSignatory {
  name: string;
  role?: string;
  signatureUrl?: string;
}

export interface PdfOptions {
  title: string;
  reportPeriod: string;
  preparedBy?: string;
  signatory?: PdfSignatory;
  headers: string[][];
  body: (string | number)[][];
}

const loadImageAsBase64 = (url?: string): Promise<string | undefined> => {
  if (!url) return Promise.resolve(undefined);
  if (url.startsWith("data:")) return Promise.resolve(url);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
          return;
        }
      } catch {
        // Fallback for tainted canvas
      }
      resolve(undefined);
    };
    img.onerror = () => resolve(undefined);
    img.src = url;
  });
};

export const generateReportPdf = (options: PdfOptions) => {
  const { title, reportPeriod, preparedBy, signatory, headers, body } = options;
  const doc = new jsPDF();

  const logoUrl = "/assets/logo.png";

  // Resolve signatory name and role without ()
  let signatoryName = "";
  let signatoryRole = "";
  let signatureUrl = "";

  if (signatory) {
    signatoryName = cleanName(signatory.name) || "Authorized Official";
    signatoryRole = signatory.role || "";
    signatureUrl = signatory.signatureUrl || "";
  } else if (preparedBy) {
    const parenMatch = preparedBy.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      signatoryName = cleanName(parenMatch[1]);
      signatoryRole = parenMatch[2];
    } else {
      signatoryName = cleanName(preparedBy);
    }
  }

  if (!signatoryName) {
    signatoryName = "Authorized Official";
  }

  // Format dates
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const generateDoc = (logoData?: string, sigData?: string) => {
    // 1. Header Area
    if (logoData) {
      doc.addImage(logoData, "PNG", 14, 10, 25, 25);
    }

    // Header Texts (Left)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 60, 110);
    doc.text("REPUBLIC OF RWANDA", 14, 42);
    doc.text("MINISTRY OF EDUCATION (MINEDUC)", 14, 48);
    doc.text("UMWANA BRIGHT ACADEMY", 14, 54);

    // Header Texts (Right)
    doc.text("P.O. Box 622 Kigali City", 196, 20, { align: "right" });

    // Top Horizontal Line
    doc.setDrawColor(30, 60, 110);
    doc.setLineWidth(0.5);
    doc.line(14, 60, 196, 60);

    // Report Details Section
    doc.setFont("helvetica", "bold");
    doc.text("REPORT DETAILS", 14, 68);

    // Orange Line
    doc.setDrawColor(230, 120, 50);
    doc.line(14, 72, 196, 72);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Report Period:", 14, 82);
    doc.setFont("helvetica", "normal");
    doc.text(reportPeriod, 45, 82);

    // Prepared By (clean name without parentheses)
    doc.setFont("helvetica", "bold");
    doc.text("Prepared By :", 14, 89);
    doc.setFont("helvetica", "normal");
    doc.text(signatoryName, 45, 89);
 

    doc.setFont("helvetica", "bold");
    doc.text("Date Generated:", 14, 96);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, 45, 96);

    // Green Line
    doc.setDrawColor(50, 150, 80);
    doc.line(14, 104, 196, 104);

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 60, 110);
    doc.text(title, 105, 118, { align: "center" });

    // 2. Table
    autoTable(doc, {
      startY: 125,
      head: headers,
      body: body,
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [50, 50, 50],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      margin: { top: 20, right: 14, bottom: 40, left: 14 },
    });

    // 3. Footer area
    const finalY = (doc as any).lastAutoTable?.finalY || 125;

    // Check if we need a new page for footer
    let footerY = finalY + 20;
    if (footerY > 230) {
      doc.addPage();
      footerY = 25;
    }

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Line 1: Name without ()
    doc.setFont("helvetica", "bold");
    doc.text("Approved By:", 14, footerY);
    doc.setFont("helvetica", "normal");
    doc.text(signatoryName, 45, footerY);

    let curY = footerY;

    // Line 2: Role at new line
    if (signatoryRole) {
      curY += 8;
      doc.setFont("helvetica", "bold");
      doc.text("", 14, curY);
      doc.setFont("helvetica", "normal");
      doc.text(signatoryRole, 45, curY);
    }

    // Line 3: Signature at new line
    curY += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Signature:", 14, curY + 6);

    if (sigData) {
      doc.addImage(sigData, "PNG", 45, curY - 2, 45, 16);
      curY += 18;
    } else {
      doc.line(45, curY + 6, 110, curY + 6);
      curY += 12;
    }

    // Line 4: Date
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 14, curY + 4);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, 45, curY + 4);

    // Page numbers and system branding
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("Generated By Ubrs System", 105, 290, { align: "center" });
    }

    doc.save(
      `${title.toLowerCase().replace(/\s+/g, "_")}_${dateStr.replace(/\s+/g, "_")}.pdf`
    );
  };

  // Preload logo and signature images before generating PDF
  Promise.all([
    loadImageAsBase64(logoUrl),
    loadImageAsBase64(signatureUrl),
  ])
    .then(([logoData, sigData]) => {
      generateDoc(logoData, sigData);
    })
    .catch(() => {
      generateDoc();
    });
};
