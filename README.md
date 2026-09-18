# MOCOF AI Quotation Converter

> Turn a Chinese supplier renovation quotation into a customer-ready, editable MOCOF quotation.

MOCOF AI Quotation Converter is a web application for renovation and custom-joinery teams. It reads supplier `.xlsx` or PDF quotations, detects the real customer spaces in the project, applies the relevant MOCOF quotation recipe, and produces a professional customer workbook in MYR.

**Live application:** [mocof-ai-quotation-converter-2siq.vercel.app](https://mocof-ai-quotation-converter-2siq.vercel.app/)

## What it does today

- Upload Chinese supplier Excel (`.xlsx`) quotations or PDF quotations.
- Detect the quotation Area (Area 1–10) by counting real rooms only—not services such as Extra m², Curve, Wall Panel, or add-ons.
- Store, select and trace the selected Area's documented MOCOF conversion prompts in the conversion workflow.
- Translate source product descriptions into professional English while retaining source information for review.
- Keep Whole House Total, Supplementary, room tables, product details, and supplier product photos.
- Review and edit the quotation in an A–J spreadsheet grid with row numbers and cell references such as `E1`, `I2`, and `J44`.
- Add boss instructions in plain English and apply them as audited AI cell transactions.
- Export the reviewed customer quotation as Excel or PDF.

## Important implementation status

The full MOCOF Prompt Documentation is preserved in
[`server/documentedPrompts.ts`](server/documentedPrompts.ts): **415 exact
prompt entries across Areas 1-10**. The app can detect an Area, display its
exact recipe, construct an editable A:J workbook, and apply audited
manager-entered prompt transactions.

However, a complete deterministic executor for every documented instruction,
formula, merge and cell coordinate across all ten Areas is still in progress.
The current generic workbook must be reviewed by an authorised MOCOF manager;
it must not be described as a fully automatic replacement for the approved
Google Sheets workflow yet. Fang and Joyce are validation examples only, never
fixed production prices or templates.

See the complete current-state handover:
[MOCOF_Quotation_Converter_Project_Handover.pdf](output/pdf/MOCOF_Quotation_Converter_Project_Handover.pdf).

## Main workflow

```text
Upload Chinese quotation
        ↓
Detect Area and read source tables
        ↓
Select MOCOF Area recipe and parse/translate source content
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

## Production architecture: persistent background conversion

Vercel functions are intentionally used only for the website, job creation,
and job-status polling. They are not a safe place to run a full, multi-step
Gemini quotation conversion because the request can time out.

```text
Browser upload → Vercel Blob (immutable source file)
              → GitHub Actions dispatch
              → GitHub Actions worker (runs selected Area recipe in order)
              → Vercel Blob (preserved converted XLSX + result JSON)
              → Browser polls job status and opens the editable quote
```

The worker is a safety scaffold until an approved `AreaRecipeExecutor` is
connected. It fails closed: it will never use the old generic table builder or
claim a prompt was applied when it was not.

## Deploy to Vercel

1. Import this repository into Vercel.
2. In **Project Settings → Environment Variables**, add these values for Production and Preview:
   - `GEMINI_API_KEY`
   - `BLOB_READ_WRITE_TOKEN` (create a Vercel Blob store and copy its token)
   - `GITHUB_DISPATCH_TOKEN` (a GitHub fine-grained token with **Contents: Read and write** for this repository)
   - `MOCOF_GITHUB_REPOSITORY` = `Chen-maker-pen/mocof-ai-quotation-converter`
3. In the GitHub repository, open **Settings → Secrets and variables → Actions** and add:
   - `BLOB_READ_WRITE_TOKEN` (the same Vercel Blob token)
   - `GEMINI_API_KEY` (the same server-only Gemini key)
4. Redeploy Vercel. The app can then queue a persistent conversion job instead of waiting inside a browser request. GitHub Actions has a 30-minute timeout for the worker.

> Do not put the Gemini API key in frontend code or commit it to GitHub.

## Important review practice

AI prepares the quotation, but prices, discounts, formulas, product specifications, and customer details must be reviewed by an authorised MOCOF manager before sending the final customer version. The original supplier workbook is retained as the source record, while the customer workbook is the editable output.

## Handover and next development work

The next developer should implement an `AreaRecipeExecutor` that runs every
selected Area prompt in documented order against a template/workbook with the
same A1 cell coordinates used by the original Google Sheets process. It should
write a prompt-to-cell transaction log and have approved fixture tests for
Areas 1-10. See the PDF handover for the full implementation plan, deployment
notes and known Vercel/Gemini limitations.

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
