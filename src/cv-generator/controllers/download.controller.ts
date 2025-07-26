// Required dependencies
import { Request, Response } from "express";
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import { chromium, firefox } from 'playwright';

// import puppeteer from 'puppeteer';

// const router = express.Router();

// Utility to compile Handlebars template
const compileTemplate = async (templateName: string, data: any): Promise<string> => {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    
    // Check if template exists
    await fs.access(templatePath);
    
    const templateHtml = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateHtml);
    return template(data);
  } catch (error) {
    throw new Error(`Template not found or invalid: ${templateName}`);
  }
};

// Route to generate PDF

export const generatePDF = async (req: Request, res: Response): Promise<void> => {
  const { data, templateName } = req.body;

  if (!data || !templateName) {
    res.status(400).json({ error: 'Missing data or templateName' });
    return;
  }

  let browser;
  
  try {
    const html = await compileTemplate(templateName, data);

    // Use either chromium or firefox
    browser = await chromium.launch({ headless: true, args: ['--font-render-hinting=none', '--disable-font-subpixel-positioning'] });
    // browser = await firefox.launch({ headless: true });
    
    const page = await browser.newPage();

    // Wait for fonts to load
    await page.setContent(html, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for fonts to fully load
    await page.waitForTimeout(3000);

    // Ensure fonts are loaded
    await page.evaluate(() => {
      return document.fonts.ready;
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '50px', bottom: '50px', left: '50px', right: '50px' },
      preferCSSPageSize: true
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf',
      'Content-Length': pdfBuffer.length.toString()
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// export const generatePDF = async (req: Request, res: Response): Promise<void> => {
// const { data, templateName } = req.body;

//   if (!data || !templateName) {
//     res.status(400).json({ error: 'Missing data or templateName' });
//     return;
//   }

//   let browser;
  
//   try {
//     const html = await compileTemplate(templateName, data);

//     browser = await puppeteer.launch({ 
//       headless: true, 
//       args: ['--no-sandbox', '--disable-setuid-sandbox'] 
//     });
    
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//     });

//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': 'attachment; filename=resume.pdf',
//       'Content-Length': pdfBuffer.length.toString()
//     });

//     res.send(pdfBuffer);
//   } catch (err) {
//     console.error('PDF generation error:', err);
    
//     if (err instanceof Error && err.message.includes('Template not found')) {
//       res.status(404).json({ error: err.message });
//       return;
//     }
    
//     res.status(500).json({ error: 'Failed to generate PDF' });
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// }

// export default router;