"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const playwright_1 = require("playwright");
// import puppeteer from 'puppeteer';
// const router = express.Router();
// Utility to compile Handlebars template
const compileTemplate = (templateName, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(__dirname, '../templates', `${templateName}.hbs`);
        // Check if template exists
        yield promises_1.default.access(templatePath);
        const templateHtml = yield promises_1.default.readFile(templatePath, 'utf-8');
        const template = handlebars_1.default.compile(templateHtml);
        return template(data);
    }
    catch (error) {
        throw new Error(`Template not found or invalid: ${templateName}`);
    }
});
// Route to generate PDF
const generatePDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, templateName } = req.body;
    if (!data || !templateName) {
        res.status(400).json({ error: 'Missing data or templateName' });
        return;
    }
    let browser;
    try {
        const html = yield compileTemplate(templateName, data);
        // Use either chromium or firefox
        browser = yield playwright_1.chromium.launch({ headless: true, args: ['--font-render-hinting=none', '--disable-font-subpixel-positioning'] });
        // browser = await firefox.launch({ headless: true });
        const page = yield browser.newPage();
        // Wait for fonts to load
        yield page.setContent(html, {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        // Wait for fonts to fully load
        yield page.waitForTimeout(3000);
        // Ensure fonts are loaded
        yield page.evaluate(() => {
            return document.fonts.ready;
        });
        const pdfBuffer = yield page.pdf({
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
    }
    catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.generatePDF = generatePDF;
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
