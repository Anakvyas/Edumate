import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export const handleDownloadPdf = async (el: HTMLElement) => {
  if (!el) return alert("No notes to export!");

  // Sanitize computed styles (avoid oklch, lab, etc.)
  const restore = inlineSafeComputedStyles(el);

  try {
    // 🌈 Step 1: Render the entire element to a canvas
    const canvas = await html2canvas(el, {
      scale: 2.5, // 2–3 is good balance between clarity & size
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // 🌈 Step 2: Calculate sizes
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 🌈 Step 3: Add image in slices (perfect page breaks)
    // Create a temporary canvas to draw each visible slice
    const pageCanvas = document.createElement("canvas");
    const pageCtx = pageCanvas.getContext("2d")!;
    const pxPerPt = 96 / 72; // convert between screen px and PDF pt
    const pageHeightPx = Math.floor(pageHeight * pxPerPt * (canvas.width / pageWidth));
    pageCanvas.width = canvas.width;
    pageCanvas.height = pageHeightPx;

    let currentPos = 0;
    let pageIndex = 0;

    while (heightLeft > 0) {
      pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0,
        currentPos,
        canvas.width,
        pageHeightPx,
        0,
        0,
        canvas.width,
        pageHeightPx
      );

      const pageData = pageCanvas.toDataURL("image/png", 1.0);
      const pageHeightInPt = (pageCanvas.height * pageWidth) / pageCanvas.width;

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(pageData, "PNG", 0, 0, pageWidth, pageHeightInPt);

      currentPos += pageHeightPx;
      heightLeft -= pageHeight;
      pageIndex++;
    }

    // 🌈 Step 4: Save the generated PDF
    pdf.save("EduMate_Notes.pdf");
  } catch (err) {
    console.error("html2canvas / jsPDF error:", err);
    alert("Failed to generate PDF. Check console for details.");
  } finally {
    // Restore original styles
    restore();
  }
};

  // call this before html2canvas
function inlineSafeComputedStyles(root: HTMLElement) {
  const propsToCopy = [
    "color",
    "background-color",
    "background",
    "background-image",
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "box-shadow",
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "text-align",
    "padding",
    "margin",
  ];

  // store originals to restore later if you want
  const originalInlineMap = new Map<HTMLElement, string>();

  const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];

  for (const node of nodes) {
    // save original inline style
    originalInlineMap.set(node, node.getAttribute("style") || "");

    const cs = getComputedStyle(node);

    // build inline style string from important props
    let inline = node.getAttribute("style") || "";

    for (const prop of propsToCopy) {
      const val = cs.getPropertyValue(prop);
      if (!val) continue;

      if (/\boklch\(/i.test(val) || /\blab\(/i.test(val) || /\bcolor\(display-p3/i.test(val)) {
        // choose a safe fallback per property
        const fallback =
          prop.includes("background") || prop === "background-image" ? "#ffffff" : "#000000";
        // convert property to JS style name
        const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        inline += `${jsProp}: ${fallback};`;
      } else {
        // safe to copy value; convert prop name to JS style name
        const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        inline += `${jsProp}: ${val};`;
      }
    }

    node.setAttribute("style", inline);
  }

  // return function to restore original inline styles
  return () => {
    for (const node of nodes) {
      const original = originalInlineMap.get(node) ?? "";
      if (original) node.setAttribute("style", original);
      else node.removeAttribute("style");
    }
  };
}



export default handleDownloadPdf;