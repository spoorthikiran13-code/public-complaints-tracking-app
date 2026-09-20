import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateReportPDF() {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Helper colors
  const primaryBlue = rgb(0.12, 0.43, 0.88); // #1f6fed
  const darkSlate = rgb(0.08, 0.12, 0.19); // #141f30
  const bodyText = rgb(0.2, 0.25, 0.33); // #334155
  const mutedText = rgb(0.4, 0.47, 0.58);
  const emeraldGreen = rgb(0.06, 0.6, 0.38);
  const tableBg = rgb(0.96, 0.97, 0.99);
  const borderGrey = rgb(0.85, 0.88, 0.93);

  // PAGE 1: Overview & Innovations
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page1.getSize();

  // Top Accent Bar
  page1.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: primaryBlue,
  });

  // Title & Header Box
  page1.drawText('CivicTrack', {
    x: 40,
    y: height - 55,
    size: 26,
    font: fontBold,
    color: primaryBlue,
  });

  page1.drawText('AI-POWERED MUNICIPAL INFRASTRUCTURE & DISPATCH SYSTEM', {
    x: 40,
    y: height - 73,
    size: 9.5,
    font: fontBold,
    color: mutedText,
  });

  // Status Badge
  page1.drawRectangle({
    x: width - 165,
    y: height - 68,
    width: 125,
    height: 24,
    color: rgb(0.92, 0.98, 0.95),
    borderColor: emeraldGreen,
    borderWidth: 1,
  });
  page1.drawText('SYSTEM VERIFIED', {
    x: width - 150,
    y: height - 58,
    size: 8.5,
    font: fontBold,
    color: emeraldGreen,
  });

  // Metadata Card
  page1.drawRectangle({
    x: 40,
    y: height - 135,
    width: width - 80,
    height: 48,
    color: tableBg,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page1.drawText('Author / Lead Developer:', { x: 55, y: height - 108, size: 8.5, font: fontRegular, color: mutedText });
  page1.drawText('Spoorthi Kiran', { x: 55, y: height - 122, size: 10, font: fontBold, color: darkSlate });

  page1.drawText('Target Platform:', { x: 195, y: height - 108, size: 8.5, font: fontRegular, color: mutedText });
  page1.drawText('Web & Progressive Web App (PWA)', { x: 195, y: height - 122, size: 9.5, font: fontBold, color: darkSlate });

  page1.drawText('GitHub Repository:', { x: 380, y: height - 108, size: 8.5, font: fontRegular, color: mutedText });
  page1.drawText('github.com/spoorthikiran13/civictrack', { x: 380, y: height - 122, size: 8.5, font: fontBold, color: primaryBlue });

  // Section 1: Executive Summary
  let currentY = height - 165;
  page1.drawText('1. Executive Summary & Problem Statement', {
    x: 40,
    y: currentY,
    size: 13,
    font: fontBold,
    color: darkSlate,
  });

  currentY -= 16;
  const summaryP1 = 'Municipal public works departments encounter major operational delays due to unorganized citizen';
  const summaryP2 = 'complaints, lack of automated department routing, duplicate work order proliferation, and network dead';
  const summaryP3 = 'zones preventing field crews from receiving or updating tickets in real-time.';
  const summaryP4 = 'CivicTrack introduces an autonomous municipal dispatch platform that analyzes text and audio complaints,';
  const summaryP5 = 'routes issues directly to appropriate divisions, strictly eliminates duplicates, and supports full offline PWA caching.';

  [summaryP1, summaryP2, summaryP3, '', summaryP4, summaryP5].forEach(line => {
    if (line) {
      page1.drawText(line, { x: 40, y: currentY, size: 9.5, font: fontRegular, color: bodyText });
    }
    currentY -= 13;
  });

  // Section 2: Core Technical Innovations (3 Pillars)
  currentY -= 15;
  page1.drawText('2. Core Architectural Pillars', {
    x: 40,
    y: currentY,
    size: 13,
    font: fontBold,
    color: darkSlate,
  });

  currentY -= 12;

  // Pillar 1 Box
  currentY -= 65;
  page1.drawRectangle({
    x: 40,
    y: currentY,
    width: width - 80,
    height: 60,
    color: rgb(0.96, 0.98, 1.0),
    borderColor: rgb(0.78, 0.86, 0.98),
    borderWidth: 1,
  });
  page1.drawText('A. AI Department Auto-Routing & SLA Engine', {
    x: 55,
    y: currentY + 42,
    size: 10.5,
    font: fontBold,
    color: primaryBlue,
  });
  page1.drawText('Extracts semantic keywords from voice recordings and descriptions to route tickets directly to division units', {
    x: 55,
    y: currentY + 26,
    size: 8.5,
    font: fontRegular,
    color: bodyText,
  });
  page1.drawText('(e.g., Roads & Pavement, Street Lighting Grid, Water Authority) with dedicated SLA targets (8h to 36h).', {
    x: 55,
    y: currentY + 13,
    size: 8.5,
    font: fontRegular,
    color: bodyText,
  });

  // Pillar 2 Box
  currentY -= 72;
  page1.drawRectangle({
    x: 40,
    y: currentY,
    width: width - 80,
    height: 60,
    color: rgb(1.0, 0.98, 0.98),
    borderColor: rgb(0.98, 0.85, 0.85),
    borderWidth: 1,
  });
  page1.drawText('B. Multi-Factor Duplicate Prevention Radar', {
    x: 55,
    y: currentY + 42,
    size: 10.5,
    font: fontBold,
    color: rgb(0.85, 0.15, 0.15),
  });
  page1.drawText('Evaluates category affinity, Haversine GPS proximity (<= 150m), municipal ward jurisdiction, and address matching.', {
    x: 55,
    y: currentY + 26,
    size: 8.5,
    font: fontRegular,
    color: bodyText,
  });
  page1.drawText('Strictly blocks redundant ticket creation and merges citizen photos/evidence into the active ticket with +1 urgency score.', {
    x: 55,
    y: currentY + 13,
    size: 8.5,
    font: fontRegular,
    color: bodyText,
  });

  // Pillar 3 Box
  currentY -= 72;
  page1.drawRectangle({
    x: 40,
    y: currentY,
    width: width - 80,
    height: 60,
    color: rgb(0.96, 0.99, 0.97),
    borderColor: rgb(0.78, 0.92, 0.85),
    borderWidth: 1,
  });
  page1.drawText('C. Offline PWA & Background Synchronization', {
    x: 55,
    y: currentY + 42,
    size: 10.5,
    font: fontBold,
    color: emeraldGreen,
  });
  page1.drawText('Features Service Worker asset caching, IndexedDB outbox storage, and transparent online/offline network detection.', {
    x: 55,
    y: currentY + 26,
    size: 8.5,
    font: fontRegular,
    color: bodyText,
  });
  page1.drawText('Reports filed with zero network connectivity are queued securely and auto-dispatched once connection restores.', {
    x: 55,
    y: currentY + 13,
    size: 8.5,
    font: fontRegular,
    color: bodyText,
  });

  // Page 1 Footer
  page1.drawLine({
    start: { x: 40, y: 45 },
    end: { x: width - 40, y: 45 },
    thickness: 1,
    color: borderGrey,
  });
  page1.drawText('CivicTrack Project Documentation | Author: Spoorthi Kiran', {
    x: 40,
    y: 30,
    size: 8,
    font: fontRegular,
    color: mutedText,
  });
  page1.drawText('Page 1 of 2', {
    x: width - 85,
    y: 30,
    size: 8,
    font: fontBold,
    color: mutedText,
  });

  // ==========================================
  // PAGE 2: Department Matrix & Specifications
  // ==========================================
  const page2 = pdfDoc.addPage([595.28, 841.89]);

  // Top Accent Bar
  page2.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: primaryBlue,
  });

  let p2Y = height - 55;
  page2.drawText('3. Municipal Department Routing Specification', {
    x: 40,
    y: p2Y,
    size: 13,
    font: fontBold,
    color: darkSlate,
  });

  p2Y -= 20;
  // Table Header
  page2.drawRectangle({
    x: 40,
    y: p2Y - 18,
    width: width - 80,
    height: 24,
    color: darkSlate,
  });

  page2.drawText('CATEGORY', { x: 48, y: p2Y - 10, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText('CODE', { x: 145, y: p2Y - 10, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText('ASSIGNED MUNICIPAL DEPARTMENT & DIVISION', { x: 215, y: p2Y - 10, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText('SLA', { x: width - 75, y: p2Y - 10, size: 8, font: fontBold, color: rgb(1, 1, 1) });

  p2Y -= 18;

  const depts = [
    { cat: 'Roads & Potholes', code: 'DEPT-TRANS-01', name: 'Dept. of Transportation (Pavement Division)', sla: '24 Hours' },
    { cat: 'Street Lighting', code: 'DEPT-ELEC-02', name: 'Bureau of Street Lighting & High-Voltage Grid', sla: '24 Hours' },
    { cat: 'Water & Sewage', code: 'DEPT-WATER-03', name: 'Municipal Water & Sewerage Authority', sla: '12 Hours' },
    { cat: 'Waste & Sanitation', code: 'DEPT-WASTE-04', name: 'Dept. of Public Sanitation & Waste Management', sla: '24 Hours' },
    { cat: 'Traffic & Signals', code: 'DEPT-TRAF-05', name: 'Traffic Operations & Intelligent Transit Systems', sla: '8 Hours' },
    { cat: 'Parks & Trees', code: 'DEPT-PARK-06', name: 'Dept. of Parks, Urban Forestry & Grounds', sla: '36 Hours' },
  ];

  depts.forEach((d, idx) => {
    p2Y -= 22;
    page2.drawRectangle({
      x: 40,
      y: p2Y - 4,
      width: width - 80,
      height: 22,
      color: idx % 2 === 0 ? tableBg : rgb(1, 1, 1),
      borderColor: borderGrey,
      borderWidth: 0.5,
    });

    page2.drawText(d.cat, { x: 48, y: p2Y + 2, size: 8, font: fontBold, color: darkSlate });
    page2.drawText(d.code, { x: 145, y: p2Y + 2, size: 7.5, font: fontMono, color: primaryBlue });
    page2.drawText(d.name, { x: 215, y: p2Y + 2, size: 8, font: fontRegular, color: bodyText });
    page2.drawText(d.sla, { x: width - 75, y: p2Y + 2, size: 8, font: fontBold, color: emeraldGreen });
  });

  // Section 4: Duplicate Scoring Formula
  p2Y -= 32;
  page2.drawText('4. Automated Duplicate Detection Formula', {
    x: 40,
    y: p2Y,
    size: 13,
    font: fontBold,
    color: darkSlate,
  });

  p2Y -= 15;
  page2.drawRectangle({
    x: 40,
    y: p2Y - 60,
    width: width - 80,
    height: 60,
    color: tableBg,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page2.drawText('Composite Match Score = (Category Affinity * 0.40) + (Ward Jurisdiction * 0.20)', {
    x: 55,
    y: p2Y - 18,
    size: 8.5,
    font: fontBold,
    color: darkSlate,
  });
  page2.drawText('                         + (Spatial Proximity <= 150m * 0.25) + (Lexical Text Match * 0.15)', {
    x: 55,
    y: p2Y - 32,
    size: 8.5,
    font: fontBold,
    color: darkSlate,
  });
  page2.drawText('Threshold: >= 55% identifies an active duplicate. The agent disallows duplicate ticket registration.', {
    x: 55,
    y: p2Y - 48,
    size: 8,
    font: fontRegular,
    color: rgb(0.85, 0.15, 0.15),
  });

  p2Y -= 78;

  // Section 5: Technical Stack Matrix
  page2.drawText('5. Technology Stack & Deployment Architecture', {
    x: 40,
    y: p2Y,
    size: 13,
    font: fontBold,
    color: darkSlate,
  });

  p2Y -= 18;
  const techCards = [
    { label: 'Frontend Framework', val: 'React 19 & TypeScript 5' },
    { label: 'Styling & UI', val: 'Tailwind CSS v4 & Lucide Icons' },
    { label: 'Offline Engine', val: 'Service Workers & IndexedDB Outbox' },
    { label: 'Spatial Mapping', val: 'Interactive GIS Ward Grid & Pins' },
    { label: 'Build & Bundling', val: 'Vite 8 & ESM Architecture' },
    { label: 'Hosting Platforms', val: 'GitHub Pages / Cloud Run / Vercel' },
  ];

  techCards.forEach((tc, tIdx) => {
    const col = tIdx % 2;
    const row = Math.floor(tIdx / 2);
    const cardX = col === 0 ? 40 : 305;
    const cardY = p2Y - (row * 36) - 28;

    page2.drawRectangle({
      x: cardX,
      y: cardY,
      width: 250,
      height: 30,
      color: tableBg,
      borderColor: borderGrey,
      borderWidth: 1,
    });
    page2.drawText(tc.label, { x: cardX + 10, y: cardY + 16, size: 7.5, font: fontRegular, color: mutedText });
    page2.drawText(tc.val, { x: cardX + 10, y: cardY + 5, size: 8.5, font: fontBold, color: darkSlate });
  });

  p2Y -= 135;

  // Section 6: PPT Links
  page2.drawText('6. Live Presentation & Repository Links', {
    x: 40,
    y: p2Y,
    size: 13,
    font: fontBold,
    color: darkSlate,
  });

  p2Y -= 16;
  page2.drawRectangle({
    x: 40,
    y: p2Y - 45,
    width: width - 80,
    height: 45,
    color: rgb(0.95, 0.97, 1.0),
    borderColor: rgb(0.75, 0.85, 0.98),
    borderWidth: 1,
  });

  page2.drawText('Interactive Demo App: https://ais-pre-t2re2hsp3i6hvlnzreoc3r-509295718433.asia-east1.run.app', {
    x: 52,
    y: p2Y - 18,
    size: 8,
    font: fontBold,
    color: primaryBlue,
  });
  page2.drawText('GitHub Pages Link:     https://spoorthikiran13.github.io/civictrack/', {
    x: 52,
    y: p2Y - 32,
    size: 8,
    font: fontBold,
    color: darkSlate,
  });

  // Page 2 Footer
  page2.drawLine({
    start: { x: 40, y: 45 },
    end: { x: width - 40, y: 45 },
    thickness: 1,
    color: borderGrey,
  });
  page2.drawText('CivicTrack Project Documentation | Author: Spoorthi Kiran', {
    x: 40,
    y: 30,
    size: 8,
    font: fontRegular,
    color: mutedText,
  });
  page2.drawText('Page 2 of 2', {
    x: width - 85,
    y: 30,
    size: 8,
    font: fontBold,
    color: mutedText,
  });

  // Save to file system
  const pdfBytes = await pdfDoc.save();
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write both names for easy access
  fs.writeFileSync(path.join(publicDir, 'CivicTrack_Project_Documentation.pdf'), pdfBytes);
  fs.writeFileSync(path.join(publicDir, 'index.pdf'), pdfBytes);

  console.log('PDF successfully generated in /public/CivicTrack_Project_Documentation.pdf and /public/index.pdf');
}

generateReportPDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
