# MOCOF AI Quotation Converter

> Turn a Chinese supplier renovation quotation into a customer-ready, editable MOCOF quotation.

MOCOF AI Quotation Converter is a web application for renovation and custom-joinery teams. It reads supplier `.xlsx` or PDF quotations, detects the real customer spaces in the project, applies the relevant MOCOF quotation recipe, and produces a professional customer workbook in MYR.

**Live application:** [mocof-ai-quotation-converter-2siq.vercel.app](https://mocof-ai-quotation-converter-2siq.vercel.app/)

## What it does

- Upload Chinese supplier Excel (`.xlsx`) quotations or PDF quotations.
- Detect the quotation Area (Area 1–10) by counting real rooms only—not services such as Extra m², Curve, Wall Panel, or add-ons.
- Apply the selected Area’s documented MOCOF conversion prompts in the conversion workflow.
- Translate source product descriptions into professional English while retaining source information for review.
- Keep Whole House Total, Supplementary, room tables, product details, and supplier product photos.
- Review and edit the quotation in an A–J spreadsheet grid with row numbers and cell references such as `E1`, `I2`, and `J44`.
- Add boss instructions in plain English and apply them as audited AI cell transactions.
- Export the reviewed customer quotation as Excel or PDF.

## Main workflow

```text
Upload Chinese quotation
        ↓
Detect Area and read source tables
        ↓
Apply MOCOF Area recipe and AI translation
        ↓
Review / edit the customer spreadsheet
        ↓
Apply boss prompts, save a draft, export XLSX or PDF
```

## Spreadsheet-first quotation editor

The customer workbook is intentionally spreadsheet-based because the approved MOCOF prompt documentation uses exact coordinates and formulas.

- Visible column letters and row numbers
- Direct in-cell editing
- Formula visibility and editable values
- Cell-based instructions, for example: `J7 is 20% discount of I7`
- Prompt transaction status: **Applied**, **Needs Review**, or **Failed**
- Prompt trace panel showing the documented Area recipe used for the quotation

## Technology

- React + TypeScript + Vite
- Express API
- Gemini API (`@google/genai`) for Chinese-to-English extraction and prompt transactions
- ExcelJS for workbook parsing and XLSX export
- jsPDF for PDF export
- Vercel for deployment

## Run locally

### Requirements

- [Bun](https://bun.sh/) 1.0 or later
- A Gemini API key from Google AI Studio (required for PDF extraction and natural-language prompt transactions)

### Setup

```bash
git clone https://github.com/Chen-maker-pen/mocof-ai-quotation-converter.git
cd mocof-ai-quotation-converter
bun install
```

Create a `.env` file in the project folder:

```env
GEMINI_API_KEY="your_gemini_api_key"
```

Start the app:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Import this repository into Vercel.
2. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` for Production and Preview.
3. Deploy or redeploy the project.
4. Use the Vercel URL to upload and convert quotations.

> Do not put the Gemini API key in frontend code or commit it to GitHub.

## Important review practice

AI prepares the quotation, but prices, discounts, formulas, product specifications, and customer details must be reviewed by an authorised MOCOF manager before sending the final customer version. The original supplier workbook is retained as the source record, while the customer workbook is the editable output.

## Repository structure

```text
api/                 Vercel API entry point
server/              Parser, calculation engine, Gemini service, exports
src/                 React application and quotation editor
server/documentedPrompts.ts
                     Area 1–10 prompt documentation used by the converter
```

---

Built for MOCOF SDN BHD — innovative, versatile, flexible custom renovation quotations.
