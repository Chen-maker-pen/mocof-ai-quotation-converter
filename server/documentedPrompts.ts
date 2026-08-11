/** AUTO-GENERATED from MOCOF Prompt Documentation.docx. Do not hand-edit. */

export interface DocumentedPrompt {
  number: string;
  category: string;
  text: string;
}

export interface DocumentedAreaPromptSet {
  areaNumber: number;
  label: string;
  prompts: DocumentedPrompt[];
}

export const DOCUMENTED_AREA_PROMPTS: DocumentedAreaPromptSet[] = [
  {
    "areaNumber": 1,
    "label": "Area 1 — 1 real room — 43 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT:\nCopy all content from Column H to Column I and Column J, from top to bottom (the entire column).\nUpdate the cell E1 to: MOCOF Whole House Quotation\nUpdated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\nRename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nContinue renaming the the followings:\nF to \"RM49800\"\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft.\nFill in Client Information: Enter “CustomerName” in cell F2, \nEnter “PropertyNamein cell F3, \nEnter “sqft” in cell F4 (Text only, no formula required.)\nClear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. \nKeep the cells as they are, just remove the text and numbers so they are empty.\nInsert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\nInsert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3.\nInsert the text \"RM/sqft\" at cell G4.\n(Remember to check the currency in design website)"
      },
      {
        "number": "3",
        "category": "ADD THE DISCOUNT PERCENTAGE:",
        "text": "ADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "4",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G8."
      },
      {
        "number": "5",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\nInsert 6 row below row 7. \nAdd the text as following to B8: B13 Extra m2, Curve, Wall Panel\nContinue add the text as following: Aluminium Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "6",
        "category": "(Project no need put deduct design fee)",
        "text": "(Project no need put deduct design fee)"
      },
      {
        "number": "7",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\nAdd a sequential row number for 'Whole House Total' starting from 1 at column A7 to “Deduct Design fee.\"."
      },
      {
        "number": "8",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:\nCreate the total for \"Whole Hose Total\" RM49800 total (F14): RM79800 Total (G14) with the calculation = (F7:F13) +49800 or 79800\nCreate a formula in cell D Total: E Total with the calculation D7: D13)\nCreate a formula in cell H total: I Total with the calculation D7: D13)"
      },
      {
        "number": "9",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \n\nApply the formula in cell F8 with extra m2. =sum (E total-20) *1999\n\nApply the formula in cell G8 with extra m2. =sum (E total-24) *1999\n\nApply the formula in cell G10 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "10",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:\nIf F4 less than 1500, then the “Deduct Design Fee” for cell F13, cell G13, and cell J13 will become \"-1500\". \n\nIf F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F13, cell G13, and cell J13 will become \"-2000\".  \n\nIf F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F13, cell G13, and cell J13 will become \"-3500\".  \n\nIf F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F13, cell G13, and cell J13 will become \"-6000\"."
      },
      {
        "number": "11",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7: I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "12",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 15\nAdd the text \"Supplementary\" in cell A16\nAdd a sequential row number for 'Supplementary' starting from 1 at column A18."
      },
      {
        "number": "13",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 17: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "14",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B18 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint with 3 color Nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "15",
        "category": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:",
        "text": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "16",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number as followings start from D18: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\nAdd the number \"0\" for 'Qty / per' start from E.\nBefore Price: Apply the \"=SUM(D18*$F$4)\" from D18 at column\" Before Price\"\nAfter Price: Apply the \"=SUM(I18*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "17",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J18:J22 to 0 for “After Price”."
      },
      {
        "number": "18",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\nInsert the text: “Total Supplementary:\" in cell A32. \nInsert the text: “Total Whole House Price with Supplementary Items\" in the next row.\nCreate the total for \"Supplementary\" row 30 Column F: \nColumn J with the calculation F18: F31"
      },
      {
        "number": "19",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABL",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\nCreate the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F: Column I with the calculation \"=F14+F32\", \nfor Column G with the calculation \"=G14 + G32\", \nfor Column I with the calculation \"=I14+I36\", \nand for Column J with the calculation \"=J14 + J32\"."
      },
      {
        "number": "20",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW—Check which total quotation",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW—Check which total quotation is the lowest\nInsert the formula in cell H4 \"=sum (row 31 the lower price/ F4)\"//\nInsert the formula in cell H4 \"=J33/F4\""
      },
      {
        "number": "21",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE\n\nCompare all the prices in the row 31, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "22",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\n\nUpdated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\nUpdated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\nUpdated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "23",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\n\nUpdated column A by replacing all instances of the text 配套品表 with Accessories Table.\nUpdated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "24",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\n\nUpdated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\nUpdated column A and column B by replacing all instances of the text 书房with书房//Study Room\nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "25",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\nPlease update Column A and column B based on these rules:\nFind: 主卧房\nReplace with: 主卧房//Master Bedroom"
      },
      {
        "number": "26",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\nUpdated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\nUpdated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "27",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\nUpdated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\nUpdated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "28",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\nUpdated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\nUpdated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "29",
        "category": "TRANSLATE 3RD HEADING:",
        "text": "TRANSLATE 3RD HEADING:\nUpdated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\nUpdated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\nUpdated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\nUpdated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "30",
        "category": "TRANSLATE THE LAST UPDATED:",
        "text": "TRANSLATE THE LAST UPDATED:\nUpdated column D by replacing all instances of the text 经手人 with Handle by.\nUpdated column D by replacing all instances of the text 顾客签名: with Customer Signature.\nUpdated the text \"Date\" by replacing all instances of the text 日期."
      },
      {
        "number": "31",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "32",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "33",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\n-From column I36=IF(REGEXMATCH(H,\"Before Price\"),\"=IF(ISNUMBER (\"1\"), H36*(1-$I$2))\".\n-Column I39:I117\"=IF(ISBLANK(H39,\"1\"),H39*(1-$I$2))\", Ignore text \"After Price\" and enter only numbers with the formula in the cell.\n-Column I40:I141=IF( REGEXMATCH(H40,\"Before Price\"), \"After Price\")\n-Apply in column I, =IF (H=\"Before Price”, “After Price). Apply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\n-apply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "34",
        "category": "RENAME",
        "text": "RENAME\n(These prompts have to run one after another if not they will mess up and result with not be correct.)\n\nFor Column H,\nStarting from cell H43 rename all the cells with the word \"Price\" in Column H to \"Software Price\".\n\nFor Column I,\nStarting from cell I43 rename all the cells with the word \"Price\" in Column I to \"Before Price\".\n\nFor Column J,\nStarting from cell J43 rename all the cells with the word \"Price\" in Column J to \"After Price\".\n\nCONVERSION\nFrom cells I44 to I222, apply this formula \"H (correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n//\nFrom cells I44 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "35",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J44 to J222, apply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n//\nFrom cells J44 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I (Correspondence*I$2, \"\")\", ignore the cells with the texts \"After Price\"."
      },
      {
        "number": "36",
        "category": "M&E Work & Curtain Table",
        "text": "M&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "37",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "38",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\n-Add the text in cell E212 -Supply and install flat Plaster Ceiling and finish with ceiling painting \n-Supply and install Lighting Point, 13A point with Schneider avatar on up to 25 units                              \n-Supply and install eyeball 7w megaman bulb fitting up to 15 units                                                  \n-Supply and install Osram LED T5 up to 25 units                                      \n-Supply and install switches up to 5 units and doorbell up to 1 unit                                 \n-Relocate to other side of the wall if needed, install fan and lighting accessory\n-Add the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\n-Add the text in cell E128: Living room, master bedroom and small room  \n-Curtain: Dimmer collection Width: 300cm                \n-Composition: 100% polyster.                       \n-Sheer:  Width 320cm with lead band           \n-Composition: 100% polyster"
      },
      {
        "number": "39",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "40",
        "category": "",
        "text": "_____________________________________________________________________\nBY MANUAL WORK:\n Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "41",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. And merge the cells with vertically"
      },
      {
        "number": "42",
        "category": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and",
        "text": "'Remark: \n①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow, if any changes during the production will subject to additional surcharge. \n④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        \n备注： \n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 \n②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      },
      {
        "number": "43",
        "category": "Delete the row with this word \"活动金额优惠价\"。",
        "text": "Delete the row with this word \"活动金额优惠价\"。"
      }
    ]
  },
  {
    "areaNumber": 2,
    "label": "Area 2 — 2 real rooms — 42 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "Area (2)",
        "text": "Area (2)"
      },
      {
        "number": "2",
        "category": "CHANGE THE TOP HEADINGS PROMPT",
        "text": "CHANGE THE TOP HEADINGS PROMPT: \n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column). \n-Update the cell E1 to: MOCOF Whole House Quotation Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "3",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT: \nRename the text as follow in row 6: A renamed to \"No.\" B to \"Space\" D to \"Wall Panel (m²)\" E to \"Cabinet (m²)\" \nContinue renamed the followings: F to \"RM49800\" G to \"RM79800\" H to \"Software Price\" I renamed to \"Before Price\" J renamed to \"After Price\""
      },
      {
        "number": "4",
        "category": "FILL IN THE CUSTOMER DETAILS",
        "text": "FILL IN THE CUSTOMER DETAILS: ⁠\n-Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft. -Fill in Client Information: Enter “CustomerName” in cell F2, enter “Property Name in cell F3, enter “sqft” in cell F4 (Text only, no formula required.) \n-Clear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. \n-Keep the cells as they are, just remove the text and numbers so they are empty. -Insert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2. \n-Insert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3. \n-Insert the text \"RM/sqft\" at cell G4. (Remember to check the currency in design website) \n-ADD THE DISCOUNT PERCENTAGE: Insert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "5",
        "category": "CLEAR THE CONTENT",
        "text": "CLEAR THE CONTENT: Clear all contents and values in the range D7:G9."
      },
      {
        "number": "6",
        "category": "INSERT EXTRA",
        "text": "INSERT EXTRA: \nInsert 6 row below row 8. Add the text as following to B9: B14 Extra m2, Curve, Wall Panel Continue add the text as following: Aluminium Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "7",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE: \n-Add the serial for 'Whole House Total' start from A7 to \"Deduct Design fee.\""
      },
      {
        "number": "8",
        "category": "(Project no need deduct design fee)",
        "text": "(Project no need deduct design fee)"
      },
      {
        "number": "9",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE: \n-Create the total for \"Whole Hose Total\" \n-Column F RM49800 total G RM79800 \n-Total with the calculation = sum (F7:F14). +4 9800 or 79800 \n-Create a formula in cell D Total: E Total with the calculation D7: D14) \n-Create a formula in cell H total: I Total with the calculation D7: D14)"
      },
      {
        "number": "10",
        "category": "APPLY THE PACKAGES FORMULA",
        "text": "APPLY THE PACKAGES FORMULA: \n\nApply the formula in cell F9 with extra m2. =sum (E total-20) *1999 \n\nApply the formula in cell G9 with extra m2. =sum (E total-24) *1999 \n\nApply the formula in cell G11 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "11",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: Add the serial for 'Whole House Total' start from A7 to \"Deduct Design fee.\""
      },
      {
        "number": "12",
        "category": "(Project no need deduct design fee)",
        "text": "(Project no need deduct design fee)"
      },
      {
        "number": "13",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA: \n-If F4 less than 1500, then the “Deduct Design Fee” for cell F14, cell G14, and cell J14 will become \"-1500\". \n\n-If F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F14, cell G14, and cell J14 will become \"-2000\". \n\n-If F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F14, cell G14, and cell J14 will become \"-3500\". \n\n-If F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F14, cell G14, and cell J14 will become \"-6000\"."
      },
      {
        "number": "14",
        "category": "Currency 19. Apply the Currency for F7",
        "text": "Currency 19. Apply the Currency for F7: I (_) with \"RM\" 20. \nApply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "15",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE: Insert 19 row below row 16 Add the text \"Supplementary\" in cell A17"
      },
      {
        "number": "16",
        "category": "Insert the TEXT Insert the text as follow in row 18:",
        "text": "Insert the TEXT Insert the text as follow in row 18: \n-A to \"No\" B to \"Name\" D to \"sqft / per\" E to \"Qty / per\" F to \"RM49800\" --- -Continue Insert the followings: G to \"RM79800\" H to \"Software Price\" I to \"Before Price\" J to \"After Price\""
      },
      {
        "number": "17",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT: \nStart from B19 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint Paint with 3 colour Nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "18",
        "category": "ADD THE SERIAL NUMBER FOR SUPPLEMENTARY TABLE",
        "text": "ADD THE SERIAL NUMBER FOR SUPPLEMENTARY TABLE: \nAdd the Sequential numbers for 'Supplementary' start the Sequential number from A19 with 1, and 2,3,4,5 Insert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "19",
        "category": "INSERT THE CONTENT AND",
        "text": "INSERT THE CONTENT AND FORMULA: \n-Add the number as followings start from D19: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50 Add the number \"0\" for 'Qty / per' start from E. \n-Before Price: Apply the \"=SUM(D19*$F$4)\" from D19 at column\" Before Price\" \n-After Price: Apply the \"=SUM(I19*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "20",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE: \n-Column F \"RM49800\" = column J \"After Price\" \n-Column G \"RM79800\" = column J \"After Price\" \nSet the values in J19:J23 to 0 for “After Price”."
      },
      {
        "number": "21",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE: \n-Insert the text: “Total Supplementary:\" in cell A33. \n-Insert the text: “Total Whole House Price with Supplementary Items\" in the next row. \n-Create the total for \"Supplementary\" Column F: Column J with the calculation F19: F32"
      },
      {
        "number": "22",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE: \n-Create the \"Total Whole House Price with Supplementary Items\" \n-for \"Supplementary\" Column F: Column I with the calculation \"=F15+F33\", \n-for Column G with the calculation \"=G14 + G33\", \n-for Column I with the calculation \"=I14 + I38\", and \n-for Column J with the calculation \"=J14 + J33\"."
      },
      {
        "number": "23",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) \nFOR PRICE REASONABLENESS REVIEW\n-Check which total quotation is the lowest Insert the formula in cell \nH4 \"=sum (row 34 the lower price/ F4)\".\n// Insert the formula in cell H4 \"=J34/F4\""
      },
      {
        "number": "24",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE \n-Compare all the prices in the row 32, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "25",
        "category": "TRANSLATE THE HEADING / WORD TRANSLATE THE TOTAL",
        "text": "TRANSLATE THE HEADING / WORD TRANSLATE THE TOTAL: \n-Updated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price. \n-Updated column A by replacing all instances of the text 配套品合计 with Accessories Total Price. \n-Updated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "26",
        "category": "TRANSLATE THE SMALL TABLE",
        "text": "TRANSLATE THE SMALL TABLE: \n-Updated column A by replacing all instances of the text 配套品表 with Accessories Table. \n-Updated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "27",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING: \n-Updated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom \n-Updated column A and column B by replacing all instances of the text 书房with书房//Study Room \n-Updated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "28",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING \n-Updated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer. \n-Please update Column A and column B based on these rules: Find: 主卧房 Replace with: 主卧房//Master Bedroom"
      },
      {
        "number": "29",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING \n-Updated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen \n-Updated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room \n-Updated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "30",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING: \n-Updated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC. \n-Updated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "31",
        "category": "**TRANSLATE TABLE 2ND HEADING",
        "text": "**TRANSLATE TABLE 2ND HEADING: \n-Updated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH. \n-Updated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "32",
        "category": "TRANSLATE COMBI",
        "text": "TRANSLATE COMBI: \n-Updated column C by replacing all instances of the text 23系统柜 with 23 system cabinet. \n-Updated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet. \n-Updated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel. \n-Updated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "33",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE: \n-H7 represents the total price for the Guest Bedroom (客卧房). \n-H8 represents the total price for the Kids Room (儿童房). \n-H9 represents the total price for the Master Bedroom (主卧房). \n-H10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "34",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE: \n-Create the Cabinet Total Price for Column H with formula: \nH54=sum(H39:53) and \nAccessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "35",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula: \n-From column I36=IF (REGEXMATCH (H,\"Before Price\"),\"=IF(ISNUMBER (\"1\"), H36*(1-$I$2))\". \n\n-Column I39:I117\"=IF(ISBLANK(H39,\"1\"), H39*(1-$I$2))\", Ignore text \"After Price\" and enter only numbers with the formula in the cell. \n\n-Column I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\") Apply in column I, =IF (H=\"Before Price”, “After Price). \n\nApply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\". \nApply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "36",
        "category": "RENAME",
        "text": "RENAME \n(These prompts must run one after another if not they will mess up and result with not be correct.) \n\n-For Column H, starting from cell H43 rename all the cells with the word \"Price\" in Column H to \"Software Price\". \n-For Column I, starting from cell I43 rename all the cells with the word \"Price\" in Column I to \"Before Price\". \n-For Column J, starting from cell J43 rename all the cells with the word \"Price\" in Column J to \"After Price\". \n-CONVERSION From cells I44 to I222, apply this formula \"H (correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n// From cells I44 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "37",
        "category": "DISCOUNT From cells J44 to J222",
        "text": "DISCOUNT From cells J44 to J222, \napply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n\n// From cells J44 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I (Correspondence*I$2, \"\")\", ignore the cells with the texts \"After Price\". \n\nM&E Work & Curtain Table Insert 11 row below row 119 Add the text \"M&E Work\" in cell A120 Add the text \"Curtain\" in cell D128"
      },
      {
        "number": "38",
        "category": "Insert the Text Insert the text as follow in row 121 and 126",
        "text": "Insert the Text Insert the text as follow in row 121 and 126: \nA to \"No\" D to \"Name\" E to \"Model\" G to \"Qty\""
      },
      {
        "number": "39",
        "category": "ADD THE CONTENT",
        "text": "ADD THE CONTENT: \n-Add the text in cell E212 Supply and install flat Plaster Ceiling and finish with ceiling painting Supply and install Lighting Point, 13A point with Schneider avatar on up to 25 units Supply and install eyeball 7w megaman bulb fitting up to 15 units Supply and install Osram LED T5 up to 25 units Supply and install switches up to 5 units and doorbell up to 1 unit Relocate to other side of the wall if needed, Install fan and lighting accessory Add the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan Add the text in cell E128: Living room, master bedroom and small room Curtain : Dimmer collection Width : 300cm Composition : 100% polyster. Sheer: Width 320cm with lead band Composition: 100% polyster"
      },
      {
        "number": "40",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA \n-Add the number for \"Qty\" column with \"1\" Add the name \"Electrical and Plaster work\" in D122 Add the name \"Curtain\" in D128"
      },
      {
        "number": "41",
        "category": "",
        "text": "BY MANUAL WORK \n-35. Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "42",
        "category": "Merge the cells with horizontally.",
        "text": "Merge the cells with horizontally. \nAnd merge the cells with vertically \n'Remark: \n①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid. \n③All products are custom made to order and once signed and proceed into production, there will be no changes allow, if any changes during the production will subject to additional surcharge. \n④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade. 备注： \n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 \n②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。' Send feedback"
      }
    ]
  },
  {
    "areaNumber": 3,
    "label": "Area 3 — 3 real rooms — 39 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT:\n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column).\n-Update the cell E1 to: MOCOF Whole House Quotation\n-Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\nRename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nContinue renamed the the followings:\nF to \"RM49800\"\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠⁠-Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft.\n-Fill in Client Information: Enter “CustomerName” in cell F2, Enter “PropertyNamein cell F3, Enter “sqft” in cell F4 (Text only, no formula required.)\n-Clear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. Keep the cells as they are, just remove the text and numbers so they are empty.\n-Insert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\n-Insert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3.\n-Insert the text \"RM/sqft\" at cell G4.\n(Remember to check the currency in design website)\nADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "3",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G10."
      },
      {
        "number": "4",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\n-Insert 6 row below row 9. \n-Add the text as following to B10: B15 Extra m2, Curve, Wall Panel\n-Continue add the text as following: Aluminium Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "5",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\nAdd the serial for 'Whole House Total' start from A7 to \"Deduct Design fee.\""
      },
      {
        "number": "6",
        "category": "(Project no need deduct design fee)",
        "text": "(Project no need deduct design fee)"
      },
      {
        "number": "7",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:\n-Create the total for \"Whole Hose Total\" Column F RM49800 total: G RM79800 Total with the calculation F7:F15) +49800 or 79800\n-Create a formula in cell D Total: E Total with the calculation D7: D15)\n-Create a formula in cell H total: I Total with the calculation D7: D15)"
      },
      {
        "number": "8",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F10 with extra m2. =sum(E16-20) *1999\nApply the formula in cell G10 with extra m2. =sum(E16-24) *1999\nApply the formula in cell G12 with Wall Panel. =sum(D16-6) *650"
      },
      {
        "number": "9",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:      ERROR\n-If F4 less than 1500, then the “Deduct Design Fee” for cell F15, cell G15, and cell J15 will become \"-1500\". \nIf F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F15, cell G15, and cell J15 will become \"-2000\".  \nIf F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F15, cell G15, and cell J15 will become \"-3500\".  \nIf F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F15, cell G15, and cell J15 will become \"-6000\"."
      },
      {
        "number": "10",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7:I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "11",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 17\nAdd the text \"Supplementary\" in cell A18"
      },
      {
        "number": "12",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 19: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "13",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B20 Defect \n-Check before start work 3D & 2D design and submission \nProject management -Post reno cleaning Floor Protection (Floor guard), \nElectrical Plaster ceiling Painting with white paint with 3 color Nippon colors Partition (normal w/o sounds proof) \nCurtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "14",
        "category": "ADD THE SERIAL NUMBER FOR SUPPLEMENTARY TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR SUPPLEMENTARY TABLE:\nAdd the Sequential numbers for 'Supplementary' start from cell A20 from 1 to 14.\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "15",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number as followings start from D20: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\nAdd the number \"0\" for 'Qty / per' start from E.\nBefore Price: Apply the \"=SUM(D20*$F$4)\" from D20 at column\" Before Price\"\nAfter Price: Apply the \"=SUM(I20*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "16",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J20:J24 to 0 for “After Price”."
      },
      {
        "number": "17",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\nInsert the text: “Total Supplementary:\" in cell A34. \nInsert the text: “Total Whole House Price with Supplementary Items\" in the next row.\nCreate the total for \"Supplementary\" Column F: Column J with the calculation F20: F33"
      },
      {
        "number": "18",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABL",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\nCreate the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F: Column I with the calculation \"=F16+F34\", \nfor Column G with the calculation \"=G16 + G34\", \nfor Column I with the calculation \"=I16 + I34\", and for Column J with the calculation \"=J14 + J34\""
      },
      {
        "number": "19",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW\nCheck which total quotation is the lowest\nInsert the formula in cell G4 \"=sum (row 35 the lower price/ F4)\"//\nInsert the formula in cell H4 \"=J35/F4\""
      },
      {
        "number": "20",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE\nCompare all the prices in the row 34, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "21",
        "category": "M&E Work & Curtain Table",
        "text": "M&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "22",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "23",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\n-Add the text in cell E212 Supply and install flat Plaster Ceiling and finish with ceiling painting \n-Supply and install Lighting Point, 13A point with Schneider avatar on up to 25 units                              \n-Supply and install eyeball 7w megaman bulb fitting up to 15 units                                                  \n-Supply and install Osram LED T5 up to 25 units                                      \n-Supply and install switches up to 5 units and doorbell up to 1 unit                                 \n-Relocate to other side of the wall if needed, install fan and lighting accessory\n-Add the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\n-Add the text in cell E128: Living room, master bedroom and small room \n-Curtain: Dimmer collection Width: 300cm, Composition: 100% polyster. --Sheer:  Width 320cm with lead band, Composition: 100% polyster"
      },
      {
        "number": "24",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "25",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\nUpdated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\nUpdated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\nUpdated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "26",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\nUpdated column A by replacing all instances of the text 配套品表 with Accessories Table.\nUpdated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "27",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\nUpdated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\nUpdated column A and column B by replacing all instances of the text 书房with书房//Study Room\nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "28",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\nPlease update Column A and column B based on these rules:\nFind: 主卧房\nReplace with: 主卧房//Master Bedroom"
      },
      {
        "number": "29",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\nUpdated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\nUpdated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "30",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\nUpdated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\nUpdated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "31",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\nUpdated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\nUpdated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "32",
        "category": "TRANSLATE COMBI:",
        "text": "TRANSLATE COMBI:\nUpdated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\nUpdated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\nUpdated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\nUpdated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "33",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅).\nCREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "34",
        "category": "Create a formula in cell",
        "text": "Create a formula in cell H68 that sums the Cabinet Total Price (H58) and the Accessories Total Price (H67) for the \"客餐厅//Living and Dining Room.\""
      },
      {
        "number": "35",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\n\nFrom column I36=IF (REGEXMATCH (H,\"Before Price\"),\"=IF (ISNUMBER (\"1\"), H36*(1-$I$2))\".\n\nColumn I39:I117\"=IF(ISBLANK(H39,\"1\"), H39*(1-$I$2))\", Ignore text \"After Price\" and enter only numbers with the formula in the cell.\n\nColumn I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\")\n\nApply in column I, =IF (H=\"Before Price”, “After Price). Apply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\napply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "36",
        "category": "RENAME",
        "text": "RENAME\nFor Column H, starting from cell H39 rename all the cells with the word \"Price\" in Column H to \"Software Price\".\n\nFor Column I, starting from cell I39 rename all the cells with the word \"Price\" in Column I to \"Before Price\".\n\nFor Column J, starting from cell J39 rename all the cells with the word \"Price\" in Column J to \"After Price\".\n\nCONVERSION\nFrom cells I40 to I222, apply this formula \"H (correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n//\nFrom cells I40 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "37",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J40 to J222, apply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n\nFrom cells J40 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I(Correspondence*I$2, \"\")\", ignore the cells with the texts \"After Price\".\n_____________________________________________________________________\nBY MANUAL WORK:\n35. Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "38",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. And merge the cells with vertically"
      },
      {
        "number": "39",
        "category": "26. 'Remark: ①This quotation is valid within 2 weeks on the date it was send out",
        "text": "26. 'Remark: \n①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details  \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow, if any changes during the production will subject to additional surcharge. \n④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        备注： \n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 \n②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      }
    ]
  },
  {
    "areaNumber": 4,
    "label": "Area 4 — 4 real rooms — 41 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "Area (4)",
        "text": "Area (4)"
      },
      {
        "number": "2",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT: \n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column). \n-Update the cell E1 to: MOCOF Whole House Quotation Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "3",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT: \n-Rename the text as follow in row 6: A renamed to \"No.\" B to \"Space\" D to \"Wall Panel (m²)\" E to \"Cabinet (m²)\" \nContinue renamed the followings: F to \"RM49800\" G to \"RM79800\" H to \"Software Price\" I renamed to \"Before Price\" J renamed to \"After Price\""
      },
      {
        "number": "4",
        "category": "FILL IN THE CUSTOMER DETAILS: ⁠",
        "text": "FILL IN THE CUSTOMER DETAILS: ⁠\n-Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft. Fill in Client Information: \nEnter “CustomerName” in cell F2, enter “PropertyNamein cell F3, enter “sqft” in cell F4 (Text only, no formula required.) \n-Clear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. \n-Keep the cells as they are, just remove the text and numbers so they are empty. –\n-Insert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2. \n-Insert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3. \n-Insert the text \"RM/sqft\" at cell G4. (Remember to check the currency in design website)"
      },
      {
        "number": "5",
        "category": "ADD THE DISCOUNT PERCENTAGE:",
        "text": "ADD THE DISCOUNT PERCENTAGE: \nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "6",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G11."
      },
      {
        "number": "7",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA: \nInsert 6 row below row 10. \nAdd the text as following to B11: B16 Extra m2, Curve, \nWall Panel Continue add the text as following: Aluminium Frame, Add-on finishing, and Deduct Design fee. (Project no need deduct design fee)"
      },
      {
        "number": "8",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE: \nAdd the serial for 'Whole House Total' start from A7 to \"Deduct Design fee.\" (Project no need deduct design fee)"
      },
      {
        "number": "9",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE: \n-Create the total for \"Whole Hose Total\" Column F RM49800 total: G RM79800 –\n-Total with the calculation F7:F16) +49800 or 79800 \n-Create a formula in cell D Total: E Total with the calculation D7: D16) \n-Create a formula in cell H total: I Total with the calculation D7: D16)"
      },
      {
        "number": "10",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F11 with extra m2. =sum (E total-20) *1999 \nApply the formula in cell G11 with extra m2. =sum (E total-24) *1999 \nApply the formula in cell G13 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "11",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA: \n-If F4 less than 1500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-1500\". \n\n-If F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-2000\". \n\n-If F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-3500\". \n\n-If F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-6000\"."
      },
      {
        "number": "12",
        "category": "Currency 19",
        "text": "Currency 19.\n-Apply the Currency for F7: I (_) with \"RM\" 20. \n-Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "13",
        "category": "SUPPLEMENTARY TABLE",
        "text": "SUPPLEMENTARY TABLE: \nInsert 19 row below row 18 \nAdd the text \"Supplementary\" in cell A19"
      },
      {
        "number": "14",
        "category": "Insert the TEXT Insert the text as follow in row 20",
        "text": "Insert the TEXT Insert the text as follow in row 20: \n-A to \"No\", B to \"Name\", D to \"sqft / per\", E to \"Qty / per\", F to \"RM49800\" –\n-Continue Insert the followings: \nG to \"RM79800\", H to \"Software Price\", I to \"Before Price\", J to \"After Price\""
      },
      {
        "number": "15",
        "category": "ADD THE NAME OF CONTENT",
        "text": "ADD THE NAME OF CONTENT: \nStart from B21 Defect Check before start work 3D & 2D design \nand submission Project management Post reno cleaning Floor Protection (Floor guard) \nElectrical Plaster ceiling Painting with white paint with 3 color Nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "16",
        "category": "ADD THE SERIAL NUMBER FOR SUPPLEMENTARY TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR SUPPLEMENTARY TABLE: \nAdd the Sequential numbers for 'Supplementary' start the Sequential number from A21 with 1 to 14. Insert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "17",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA \n-Add the number as followings start from D21: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50 \n-Add the number \"1\" for 'Qty / per' start from E. \n-Before Price: Apply the \"=SUM(D21*$F$4)\" from D21 at column\" Before Price\" -After Price: Apply the \"=SUM(I21*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "18",
        "category": "49800 & 79800 = AFTER PRICE",
        "text": "49800 & 79800 = AFTER PRICE: Column F \"RM49800\" = column J \"After Price\" Column G \"RM79800\" = column J \"After Price\" Set the values in J21:J25 to 0 for “After Price”."
      },
      {
        "number": "19",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE: \n-Insert the text: “Total Supplementary:\" in cell A35. \n-Insert the text: “Total Whole House Price with Supplementary Items\" in the next row. \n-Create the total for \"Supplementary\" Column F: Column J with the calculation F21: F34"
      },
      {
        "number": "20",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE: \n-Create the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F: Column I with the calculation \"=F17 + F35\", \n-for Column G with the calculation \"=G17 + G35\", for Column I with the calculation \"=I17 + I35\", and for Column J with the calculation \"=J17 + J35\"."
      },
      {
        "number": "21",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW\n-Check which total quotation is the lowest Insert the formula in cell H4 \"=sum (cell 36 Total Whole House Quotation with Supplementary Items J/ F4)\"// Insert the formula in cell H4 \"=J36/F4\""
      },
      {
        "number": "22",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE \nCompare all the prices in the row 34, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "23",
        "category": "M&E Work & Curtain Table",
        "text": "M&E Work & Curtain Table \nInsert 11 row below row 119 Add the text \"M&E Work\" in cell A120 Add the text \"Curtain\" in cell D128"
      },
      {
        "number": "24",
        "category": "Insert the Text Insert the text as follow in row",
        "text": "Insert the Text Insert the text as follow in row 121 and 126: A to \"No\" D to \"Name\" E to \"Model\" G to \"Qty\""
      },
      {
        "number": "25",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT: \nAdd the text in cell E212 \nSupply and install flat Plaster Ceiling and finish with ceiling painting \nSupply and install Lighting Point, 13A point with Schneider avatar on up to 25 units Supply and install eyeball 7w megaman bulb fitting up to 15 units \nSupply and install Osram LED T5 up to 25 units \nSupply and install switches up to 5 units and doorbell up to 1 unit \nRelocate to other side of the wall if needed, Install fan and lighting accessory \nAdd the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan \nAdd the text in cell E128: Living room, master bedroom and small room \nCurtain: Dimmer collection Width: 300cm Composition: 100% polyester. \nSheer: Width 320cm with lead band Composition: 100% polyester"
      },
      {
        "number": "26",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA \nAdd the number for \"Qty\" column with \"1\" \nAdd the name \"Electrical and Plaster work\" in D122 \nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "27",
        "category": "TRANSLATE THE HEADING / WORD TRANSLATE THE TOTAL",
        "text": "TRANSLATE THE HEADING / WORD TRANSLATE THE TOTAL: \nUpdated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price. \nUpdated column A by replacing all instances of the text 配套品合计 with Accessories Total Price. \nUpdated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "28",
        "category": "TRANSLATE THE SMALL TABLE",
        "text": "TRANSLATE THE SMALL TABLE: \nUpdated column A by replacing all instances of the text 配套品表 with Accessories Table. \nUpdated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "29",
        "category": "TRANSLATE TABLE 1ST HEADING",
        "text": "TRANSLATE TABLE 1ST HEADING: \nUpdated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom \nUpdated column A and column B by replacing all instances of the text 书房with书房//Study Room \nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "30",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING \nUpdated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer. \nPlease update Column A and column B based on these rules: Find: 主卧房 Replace with: 主卧房//Master Bedroom"
      },
      {
        "number": "31",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING \n\nUpdated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen \nUpdated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room \nUpdated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "32",
        "category": "TRANSLATE TABLE 2ND HEADING",
        "text": "TRANSLATE TABLE 2ND HEADING: \n\nUpdated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC. \nUpdated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "33",
        "category": "**TRANSLATE TABLE 2ND HEADING",
        "text": "**TRANSLATE TABLE 2ND HEADING: \n\nUpdated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH. \n\nUpdated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "34",
        "category": "TRANSLATE COMBI:",
        "text": "TRANSLATE COMBI: \nUpdated column C by replacing all instances of the text 23系统柜 with 23 system cabinet. \nUpdated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet. \nUpdated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel. \nUpdated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "35",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE: \nH7 represents the total price for the Guest Bedroom (客卧房). \nH8 represents the total price for the Kids Room (儿童房). \nH9 represents the total price for the Master Bedroom (主卧房). \nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "36",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE: \nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "37",
        "category": "Create a formula in cell H68",
        "text": "Create a formula in cell H68 that sums the Cabinet Total Price (H58) and the Accessories Total Price (H67) for the \"客餐厅//Living and Dining Room.\""
      },
      {
        "number": "38",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula: \n\nFrom column I36=IF (REGEXMATCH (H,\"Before Price\"),\"=IF (ISNUMBER (\"1\"), H36*(1-$I$2))\". \n\nColumn I39:I117\"=IF(ISBLANK(H39,\"1\"), H39*(1-$I$2))\", \n\nIgnore text \"After Price\" and enter only numbers with the formula in the cell. \n\nColumn I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\") \n\nApply in column I, =IF (H=\"Before Price”, “After Price). \n\nApply to column I from I36 =IF(H36,\"1\",\"'1'(1-$I$2))\". \n\nApply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\" RENAME (These prompts must run one after another if not they will mess up and result with not be correct.) \n\nFor Column H, starting from cell H43 rename all the cells with the word \"Price\" in Column H to \"Software Price\". \nFor Column I, starting from cell I43 rename all the cells with the word \"Price\" in Column I to \"Before Price\". \nFor Column J, starting from cell J43 rename all the cells with the word \"Price\" in Column J to \"After Price\". \nCONVERSION From cells I44 to I222, apply this formula \"H (correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n// From cells I44 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (CorrespondenceH$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "39",
        "category": "DISCOUNT From cells J44 to J222",
        "text": "DISCOUNT From cells J44 to J222, \napply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n// From cells J44 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I (Correspondence*I$2, \"\")\", ignore the cells with the texts \"After Price\"."
      },
      {
        "number": "40",
        "category": "BY MANUAL WORK",
        "text": "BY MANUAL WORK: \n35. Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "41",
        "category": "Merge the cells with horizontally. And merge the cells with vertically",
        "text": "Merge the cells with horizontally. And merge the cells with vertically \n'Remark: \n①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid. \n③All products are custom made to order and once signed and proceed into production, there will be no changes allow, if any changes during the production will subject to additional surcharge. \n④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade. 备注： \n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 \n②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。 Send feedback"
      }
    ]
  },
  {
    "areaNumber": 5,
    "label": "Area 5 — 5 real rooms — 42 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT:\nCopy all content from Column H to Column I and Column J, from top to bottom (the entire column).\nUpdate the cell E1 to: MOCOF Whole House Quotation\nUpdated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\nRename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nF to \"RM49800\"\nContinue renamed the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠-Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft.\n-Fill in Client Information: Enter “CustomerName” in cell F2, Enter “PropertyNamein cell F3, Enter “sqft” in cell F4 (Text only, no formula required.)\n-Clear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. Keep the cells as they are, just remove the text and numbers so they are empty.\n-Insert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\n-Insert the text \"Budget\" at cell G3 and Insert Customer Budget at cell H3.\n-Insert the text \"RM/sqft\" at cell G4.\n(Remember to check the currency in design website)\n-ADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "3",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G12."
      },
      {
        "number": "4",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\nInsert 6 row below row 11. \nAdd the text as following to B12: B17 Extra m2, Curve, Wall Panel\nContinue add the text as following: Aluminum Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "5",
        "category": "(Project no need put deduct design fee)",
        "text": "(Project no need put deduct design fee)"
      },
      {
        "number": "6",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\n-Add a sequential row number for 'Whole House Total' starting from 1 at column A7 to “Deduct Design fee.\"."
      },
      {
        "number": "7",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:\n-Create the total for \"Whole Hose Total\" RM49800 total (F14): RM79800 Total (G14) with the calculation = (F7:F17)+49800 or 79800\n\n-Create a formula in cell D Total: E Total with the calculation D7: D17)\n\n-Create a formula in cell H total: I Total with the calculation D7: D17)"
      },
      {
        "number": "8",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F12 with =sum (E total-20) *1999\nApply the formula in cell G12 with =sum (E total-24) *1999\nApply the formula in cell G14 with =sum (D total-6) *650"
      },
      {
        "number": "9",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:\n-If F4 less than 1500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-1500\". \n-If F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-2000\".  \n-If F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-3500\".  \n-If F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-6000\"."
      },
      {
        "number": "10",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7: I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "11",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 19\nAdd the text \"Supplementary\" in cell A20\nAdd a sequential row number for 'Supplementary' starting from 1 to 14 at column A22:A35."
      },
      {
        "number": "12",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 21: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "13",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B22 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint with 3 color Nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "14",
        "category": "INSERT THE SUPPLEMENTARY DISCOUNT RATE",
        "text": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "15",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\n-Add the number as followings start from D22: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\n-Add the number \"0\" for 'Qty / per' start from E.\n-Before Price:  Apply the \"=SUM(D22*$F$4)\" from D22 at column\" Before Price\" (H22).\n-After Price: Apply the \"=SUM(I22*I3)\" at column J at column\" \n-After Price\" (I22)."
      },
      {
        "number": "16",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J22:J26 to 0 for “After Price”."
      },
      {
        "number": "17",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\n-Insert the text: “Total Supplementary:\" in cell A36. \n-Insert the text: “Total Whole House Price with Supplementary Items\" in the next row.\n-Create the total for \"Supplementary\" row 30 Column F: Column J with the calculation F22: F35"
      },
      {
        "number": "18",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\n-Create the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F with the calculation \"=F18+F36\", for Column G with the calculation \"=G18+G36\", for Column I with the calculation = \"I18+I36\", and for Column J with the calculation = \"J18+J36\"."
      },
      {
        "number": "19",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW\n-Check which total quotation is the lowest\nInsert the formula in cell H4 \"=sum (row 37 the lower price/ F4)\" \nInsert the formula in cell H4 \"=J37/F4\""
      },
      {
        "number": "20",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE\nCompare all the prices in the row 37, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "21",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\n-Updated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\n-Updated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\n-Updated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "22",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\n-Updated column A by replacing all instances of the text 配套品表 with Accessories Table.\n-Updated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "23",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\n-Updated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\n-Updated column A and column B by replacing all instances of the text 书房with书房//Study Room\n-Updated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "24",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\n-Updated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\n-Please update Column A and column B based on these rules:\n-Find: 主卧房\n-Replace with: 主卧房//Master Bedroom"
      },
      {
        "number": "25",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\n-Updated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\n-Updated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\n-Updated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "26",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\n-Updated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\n-Updated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "27",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\n-Updated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\n-Updated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "28",
        "category": "TRANSLATE 3RD HEADING:",
        "text": "TRANSLATE 3RD HEADING:\n-Updated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\n\n-Updated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\n\n-Updated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\n\n-Updated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "29",
        "category": "TRANSLATE THE LAST UPDATED:",
        "text": "TRANSLATE THE LAST UPDATED:\n-Updated column C by replacing all instances of the text 经手人 with Handle by.\n-Updated column C by replacing all instances of the text 顾客签名 with.\nUpdated the text \"Date\" by replacing all instances of the text 日期."
      },
      {
        "number": "30",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\n\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "31",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\n\nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "32",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\n\nFrom column I36=IF(REGEXMATCH(H,\"BeforePrice\"),\"=IF(ISNUMBER (\"1\"), H36*(1-$I$2))\".\n\nColumn I39:I117\"=IF(ISBLANK(H39,\"1\"), H39*(1-$I$2))\", \nIgnore text \"After Price\" and enter only numbers with the formula in the cell.\n\nColumn I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\")\n\nApply in column I, =IF (H=\"Before Price”, “After Price). Apply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\n\napply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "33",
        "category": "RENAME",
        "text": "RENAME\n(These prompts have to run one after another if not they will mess up and result with not be correct.)\nFor Column H,\nStarting from cell H41 rename all the cells with the word \"Price\" in Column H to \"Software Price\".\n\nFor Column I,\nStarting from cell I41 rename all the cells with the word \"Price\" in Column I to \"Before Price\".\n\nFor Column J,\nStarting from cell J41 rename all the cells with the word \"Price\" in Column J to \"After Price\".\n\nCONVERSION\nFrom cells I42 to I154, apply this formula \"H (correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n\nFrom cells I42 to I154, \napply this formula \"IF (ISNUMBER (H (Correspondence Cell), \nH (Correspondence*H$2, \"\")\", \nignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "34",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J42 to J154, \napply this formula \"I (correspondence cell) * I2\", \nignore the cells with the texts \"Price\" and \"After Price\". \n\nFrom cells J42 to J154, \napply this formula \"IF (ISNUMBER (I (Correspondence Cell), \nI (Correspondence*I$2, \"\")\", \nignore the cells with the texts \"After Price\"."
      },
      {
        "number": "35",
        "category": "M&E Work & Curtain Table",
        "text": "M&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "36",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "37",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\nAdd the text in cell E212 \nSupply and install flat Plaster Ceiling and finish with ceiling painting            \n                         \nSupply and install Lighting Point, 13A point with Schneider avatar on up to 25 units   \n                           \nSupply and install eyeball 7w megaman bulb fitting up to 15 units\n          \nSupply and install Osram LED T5 up to 25 units                                 \nSupply and install switches up to 5 units and doorbell up to 1 unit                                 \nRelocate to other side of the wall if needed, install fan and lighting accessory\n\nAdd the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\n\nAdd the text in cell E128: Living room, master bedroom and \nsmall room Curtain: \nDimmer collection Width: 300cm \nComposition: 100% polyster.                       \nSheer:  Width 320cm with lead band           \nComposition: 100% polyster"
      },
      {
        "number": "38",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "39",
        "category": "",
        "text": "BY MANUAL WORK:\n Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "40",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. And merge the cells with vertically"
      },
      {
        "number": "41",
        "category": "'Remark:",
        "text": "'Remark: \n①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details  \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow , if any changes during the production will subject to additional surcharge. ④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        备注： \n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 \n②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      },
      {
        "number": "42",
        "category": "Delete the row with this word \"活动金额优惠价\"。",
        "text": "Delete the row with this word \"活动金额优惠价\"。"
      }
    ]
  },
  {
    "areaNumber": 6,
    "label": "Area 6 — 6 real rooms — 42 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT:\n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column).\n-Update the cell E1 to: MOCOF Whole House Quotation\n-Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\nRename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nContinue renamed the followings:\nF to \"RM49800\"\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠Rename the cells (E2:E4), in order, as follows: \nCustomer Name, Address, Sqft.\n\nFill in Client Information: \nEnter “CustomerName” in cell F2, \nEnter “PropertyNamein cell F3, \nEnter “sqft” in cell F4 (Text only, no formula required.)\n\nClear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. Keep the cells as they are, just remove the text and numbers so they are empty.\n\nInsert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\nInsert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3.\n\nInsert the text \"RM/sqft\" at cell G4.\n(Remember to check the currency in design website)\n\nADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "3",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G13."
      },
      {
        "number": "4",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\nInsert 6 row below row 12. \nAdd the text as following to B13: B18 Extra m2, Curve, Wall Panel\nContinue add the text as following: Aluminum Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "5",
        "category": "(Project no need put deduct design fee)",
        "text": "(Project no need put deduct design fee)"
      },
      {
        "number": "6",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\nAdd a sequential row number for 'Whole House Total' starting from 1 at column A7 to “Deduct Design fee.\"."
      },
      {
        "number": "7",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:\nCreate the total for \"Whole Hose Total\" RM49800 total (F14): RM79800 Total (G14) with the calculation = (F7:F18) +49800 or 79800\n\nCreate a formula in cell D Total: E Total with the calculation D7: D18)\nCreate a formula in cell H total: I Total with the calculation D7: D18)"
      },
      {
        "number": "8",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F13 with extra m2. =sum (E total-20) *1999\nApply the formula in cell G13 with extra m2. =sum (E total-24) *1999\nApply the formula in cell G15 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "9",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:\n-If F4 less than 1500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-1500\". \n-If F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-2000\".  \n-If F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-3500\".  \n-If F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-6000\"."
      },
      {
        "number": "10",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7: I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "11",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 20\nAdd the text \"Supplementary\" in cell A21\nAdd a sequential row number for 'Supplementary' starting from 1 at column A23."
      },
      {
        "number": "12",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 22: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "13",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B23 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint with 3 color Nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "14",
        "category": "INSERT THE SUPPLEMENTARY DISCOUNT RATE",
        "text": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:\n\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "15",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA \n\n-Add the number as followings start from D23: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\n-Add the number \"0\" for 'Qty / per' start from E.\n-Before Price: Apply the \"=SUM(D23*$F$4)\" from D23 at column\" Before Price\"\n-After Price: Apply the \"=SUM(I23*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "16",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J23:J27 to 0 for “After Price”."
      },
      {
        "number": "17",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\nInsert the text: “Total Supplementary:\" in cell A37. \nInsert the text: “Total Whole House Price with Supplementary Items\" in the next row.\nCreate the total for \"Supplementary\" row 30 Column F: Column I with the calculation F23: F36"
      },
      {
        "number": "18",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABL",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\n-Create the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F with the calculation \n\"=F19+F37\", for Column I with the calculation = \"I19+I37\", \nand for Column J with the calculation = \"J19+J37\"."
      },
      {
        "number": "19",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW\n-Check which total quotation is the lowest\nInsert the formula in cell H4 \"=sum (row 39 the lower price/ F4)\" //\nInsert the formula in cell H4 \"=J39/F4\""
      },
      {
        "number": "20",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE\nCompare all the prices in the row 39, \ntotal price row: including all 4 prices, \nthen highlight the lowest price with the green color"
      },
      {
        "number": "21",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\n-Updated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\n-Updated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\n-Updated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "22",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\n-Updated column A by replacing all instances of the text 配套品表 with Accessories Table.\n-Updated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "23",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\n-Updated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\n-Updated column A and column B by replacing all instances of the text 书房with书房//Study Room\nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "24",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\n-Updated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\n-Please update Column A and column B based on these rules:\nFind: 主卧房\n-Replace with: 主卧房//Master Bedroom"
      },
      {
        "number": "25",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\n-Updated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\n-Updated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\n-Updated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "26",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\n-Updated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\n-Updated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "27",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\n-Updated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\n-Updated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "28",
        "category": "TRANSLATE 3RD HEADING:",
        "text": "TRANSLATE 3RD HEADING:\n-Updated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\n-Updated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\n-Updated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\n-Updated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "29",
        "category": "TRANSLATE THE LAST UPDATED:",
        "text": "TRANSLATE THE LAST UPDATED:\n-Updated column C by replacing all instances of the text 经手人 with Handle by.\n-Updated column C by replacing all instances of the text 顾客签名 with.\n-Updated the text \"Date\" by replacing all instances of the text 日期."
      },
      {
        "number": "30",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "31",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\nCreate the Cabinet Total Price for Column H with formula: H54=sum (H39:53) and \nAccessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "32",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\n-From column I36=IF (REGEXMATCH (H,\"Before Price\"),\"=IF (ISNUMBER (\"1\"), H36*(1-$I$2))\".\n\nColumn I39:I117\"=IF(ISBLANK(H39,\"1\"), H39*(1-$I$2))\", Ignore text \"After Price\" and enter only numbers with the formula in the cell.\n\nColumn I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\")\n\nApply in column I, =IF (H=\"Before Price”, “After Price). Apply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\n\nApply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "33",
        "category": "RENAME",
        "text": "RENAME\n(These prompts have to run one after another if not they will mess up and result with not be correct.)\nFor Column H,\nStarting from cell H42 rename all the cells with the word \"Price\" in Column H to \"Software Price\".\n\nFor Column I,\nStarting from cell I42 rename all the cells with the word \"Price\" in Column I to \"Before Price\".\n\nFor Column J,\nStarting from cell J42 rename all the cells with the word \"Price\" in Column J to \"After Price\".\n\nCONVERSION\nFrom cells I43 to I222, apply this formula \"H (correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n//\nFrom cells I43 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "34",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J43 to J222, apply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n//\nFrom cells J43 to J222, \napply this formula \"IF (ISNUMBER (I (Correspondence Cell), I (Correspondence*I$2, \"\")\", \nignore the cells with the texts \"After Price\"."
      },
      {
        "number": "35",
        "category": "M&E Work & Curtain Table",
        "text": "M&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "36",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "37",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\nAdd the text in cell E212 Supply and install flat Plaster Ceiling and finish with ceiling painting                                     \n\nSupply and install Lighting Point, 13A point with  Schneider avatar on up to 25 units                              \n\nSupply and install eyeball 7w megaman bulb\nfitting up to 15 units                                                  \n\nSupply and install Osram LED T5 up to 25 units                                      \n\nSupply and install switches up to 5 units and doorbell up to 1 unit                                 \n\nRelocate to other side of the wall if needed, install fan and lighting accessory\n\nAdd the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\n\nAdd the text in cell E128: Living room, master bedroom and small room Curtain: Dimmer collection Width: 300cm                \nComposition: 100% polyster.                       \nSheer:  Width 320cm with lead band           \nComposition: 100% polyster"
      },
      {
        "number": "38",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "39",
        "category": "",
        "text": "BY MANUAL WORK:\n Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "40",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. And merge the cells with vertically"
      },
      {
        "number": "41",
        "category": "'Remark:",
        "text": "'Remark: \n①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow, if any changes during the production will subject to additional surcharge. ④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        备注： \n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 \n②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 ③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      },
      {
        "number": "42",
        "category": "Delete the row with this word \"活动金额优惠价\"。",
        "text": "Delete the row with this word \"活动金额优惠价\"。"
      }
    ]
  },
  {
    "areaNumber": 7,
    "label": "Area 7 — 7 real rooms — 42 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT:\n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column).\n-Update the cell E1 to: MOCOF Whole House Quotation\n-Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\n-Rename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nF to \"RM49800\"\nContinue renamed the the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft.\nFill in Client Information: Enter “CustomerName” in cell F2, Enter “PropertyName\" in cell F3, Enter “sqft” in cell F4 (Text only, no formula required.)\nClear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. Keep the cells as they are, just remove the text and numbers so they are empty.\nInsert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\nInsert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3.\nInsert the text \"RM/sqft\" at cell G4.\n(Remember to check the currency in design website)\nADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "3",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G14."
      },
      {
        "number": "4",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\nInsert 6 row below row 13. \nAdd the text as following to B14: B19 Extra m2, Curve, Wall Panel\nContinue add the text as following: Aluminum Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "5",
        "category": "(Project no need put deduct design fee)",
        "text": "(Project no need put deduct design fee)"
      },
      {
        "number": "6",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\n-Add a sequential row number for 'Whole House Total' starting from 1 at column A7 to “Deduct Design fee.\"."
      },
      {
        "number": "7",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTAL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTAL\" TABLE:\n-Create the total for \"Whole Hose Total\" RM49800 total (F14): RM79800 Total (G14) with the calculation = (F7:F19) +49800 or 79800\n\nCreate a formula in cell D Total: E Total with the calculation D7: D19)\nCreate a formula in cell H total: I Total with the calculation D7: D18)"
      },
      {
        "number": "8",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F14 with extra m2. =sum (E total - 20) *1999\nApply the formula in cell G14 with extra m2. =sum (E total - 24) *1999\nApply the formula in cell G16 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "9",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:\nIf F4 less than 1500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-1500\". \nIf F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-2000\".  \nIf F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-3500\".  \nIf F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-6000\"."
      },
      {
        "number": "10",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7: I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "11",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 21\nAdd the text \"Supplementary\" in cell A22\nAdd a sequential row number for 'Supplementary' starting from 1 to 14 from cell A24 to cell A37."
      },
      {
        "number": "12",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 23: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "13",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B24 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint with 3 color nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "14",
        "category": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:",
        "text": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "15",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA\n-Add the number as followings start from D24: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\n-Add the number \"0\" for 'Qty / per' start from E.\n-Before Price: Apply the \"=SUM(D24*$F$4)\" from D24 at column I at column\" Before Price\"\n-After Price: Apply the \"=SUM(I24*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "16",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J24:J28 to 0 for “After Price”."
      },
      {
        "number": "17",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\nInsert the text: “Total Supplementary:\" in cell A38. Insert the text: “Total Whole House Price with Supplementary Items\" in the next row.\nCreate the total for \"Supplementary\" row 38 Column F: Column J with the calculation F24: F37"
      },
      {
        "number": "18",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABL",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\nCreate the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F with the calculation \"F20+F38\", for Column G with the calculation \"G20 + G38\", for Column I with the calculation = \"I20+I38”, and for Column J with the calculation = \"J20+J38\"."
      },
      {
        "number": "19",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW—Check which total quotation is the lowest"
      },
      {
        "number": "20",
        "category": "Insert the formula in cell H4",
        "text": "Insert the formula in cell H4 \"=sum (row 39 the lower price/ F4)\" //\nInsert the formula in cell H4 \"=J39/F4\"\n\nHIGHLIGHT THE CHEAPEST PRICE\nCompare all the prices in the row 39, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "21",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\nUpdated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\nUpdated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\nUpdated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "22",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\nUpdated column A by replacing all instances of the text 配套品表 with Accessories Table.\nUpdated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "23",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\nUpdated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\nUpdated column A and column B by replacing all instances of the text 书房with书房//Study Room\nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "24",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\nPlease update Column A and column B based on these rules:\nFind: 主卧房\nReplace with: 主卧房//Master Bedroom"
      },
      {
        "number": "25",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\nUpdated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\nUpdated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "26",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\nUpdated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\nUpdated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "27",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\nUpdated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\nUpdated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "28",
        "category": "TRANSLATE 3RD HEADING:",
        "text": "TRANSLATE 3RD HEADING:\nUpdated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\nUpdated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\nUpdated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\nUpdated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "29",
        "category": "TRANSLATE THE LAST UPDATED:",
        "text": "TRANSLATE THE LAST UPDATED:\nUpdated column C by replacing all instances of the text 经手人 with Handle by.\nUpdated column C by replacing all instances of the text 顾客签名 with.\nUpdated the text \"Date\" by replacing all instances of the text 日期."
      },
      {
        "number": "30",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "31",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "32",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\nFrom column I36=IF (REGEXMATCH (H,\"Before Price\"),\"=IF (ISNUMBER (\"1\"), H36*(1-$I$2))\".\n\nColumn I39:I117\"=IF(ISBLANK(H39,\"1\"), H39*(1-$I$2))\", \nIgnore text \"After Price\" and enter only numbers with the formula in the cell.\n\nColumn I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\")\nApply in column I, =IF (H=\"Before Price”, “After Price). Apply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\n\napply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "33",
        "category": "RENAME",
        "text": "RENAME\n(These prompts have to run one after another if not they will mess up and result with not be correct.)\nFor Column H,\nStarting from cell H43 for entire column H rename all the cells with the word \"Price\" in Column H to \"Software Price\".\nFor Column I,\nStarting from cell I43 for entire column I rename all the cells with the word \"Price\" in Column I to \"Before Price\".\nFor Column J,\nStarting from cell J43 for entire column J rename all the cells with the word \"Price\" in Column J to \"After Price\".\nCONVERSION\nFrom cells I44 to I222, apply this formula \"H(correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n//\nFrom cells I44 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "34",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J44 to J222, apply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n//\nFrom cells J44 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I(Correspondence*I$2, \"\")\", ignore the cells with the texts \"After Price\".\nAssigning Prices From Each Table to Whole House\n**The cells number vary based on the number of items in each cabinet table. **\nAssign the values for Before Price:\nI7 = I50\nI8 = I74\nI9 = I130\nI10 = I147\nContinue Assigning the Values:\nI11 = I175\nI12 = I207\nI13 = I222"
      },
      {
        "number": "35",
        "category": "Assign the values for After Price:",
        "text": "Assign the values for After Price:\nJ7 = J50\nJ8 = J74\nJ9 = J130\nJ10 = J147\nContinue Assigning the Values:\nJ11 = J175\nJ12 = J207\nJ13 = J222\nM&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "36",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "37",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\nAdd the text in cell E212 Supply and install flat Plaster Ceiling and finish with ceiling painting                                     \nSupply and install Lighting Point, 13A point with Schneider avatar on up to 25 units                              \nSupply and install eyeball 7w megaman bulb\nfitting up to 15 units                                                  \nSupply and install Osram LED T5 up to 25 units                                      \nSupply and install switches up to 5 units and doorbell up to 1 unit                                 \nRelocate to other side of the wall if needed, \nInstall fan and lighting accessory\nAdd the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\nAdd the text in cell E128: Living room, master bedroom and \nsmall room Curtain: Dimmer collection Width: 300cm                \nComposition: 100% polyster.                       \nSheer:  Width 320cm with lead band           \nComposition: 100% polyster"
      },
      {
        "number": "38",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "39",
        "category": "",
        "text": "BY MANUAL WORK:\n Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "40",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. And merge the cells with vertically"
      },
      {
        "number": "41",
        "category": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and",
        "text": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details  ②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow , if any changes during the production will subject to additional surcharge. ④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        备注： ①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 ②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 ③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 ④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      },
      {
        "number": "42",
        "category": "Delete the row with this word \"活动金额优惠价\"。",
        "text": "Delete the row with this word \"活动金额优惠价\"。"
      }
    ]
  },
  {
    "areaNumber": 8,
    "label": "Area 8 — 8 real rooms — 40 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT:\n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column).\n-Update the cell E1 to: MOCOF Whole House Quotation\n-Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\nRename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nF to :RM49800\"\nContinue renamed the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft.\nFill in Client Information: Enter “CustomerName” in cell F2, Enter “PropertyNamein cell F3, Enter “sqft” in cell F4 (Text only, no formula required.)\n\nClear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. Keep the cells as they are, just remove the text and numbers so they are empty.\n\nInsert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\nInsert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3.\nInsert the text \"RM/sqft\" at cell G4.\n\n(Remember to check the currency in design website)\nADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "3",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G15."
      },
      {
        "number": "4",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\nInsert 6 row below row 14. \nAdd the text as following to B15: B20 Extra m2, Curve, Wall Panel\nContinue add the text as following: Aluminum Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "5",
        "category": "(Project no need put deduct design fee)",
        "text": "(Project no need put deduct design fee)"
      },
      {
        "number": "6",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\nAdd a sequential row number for 'Whole House Total' starting from 1 at column A7 to “Deduct Design fee.\"."
      },
      {
        "number": "7",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:\nCreate the total for \"Whole Hose Total\" RM49800 total (F14): RM79800 Total (G14) with the calculation = (F7:F20) +49800 or 79800\nCreate a formula in cell D Total: E Total with the calculation D7: D20)\nCreate a formula in cell H total: I Total with the calculation D7: D19)"
      },
      {
        "number": "8",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F15 with extra m2. =sum (E total-20) *1999\nApply the formula in cell G15 with extra m2. =sum (E total-24) *1999\nApply the formula in cell G17 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "9",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:\nIf F4 less than 1500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-1500\". \nIf F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-2000\".  \nIf F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-3500\".  \nIf F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-6000\"."
      },
      {
        "number": "10",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7: I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "11",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 22\nAdd the text \"Supplementary\" in cell A23\nAdd a sequential row number for 'Supplementary' starting from 1 at cellA25:A38."
      },
      {
        "number": "12",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 24: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "13",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B25 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint with 3 color nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror\nINSERT THE SUPPLEMENTARY DISCOUNT RATE:\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "14",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number as followings start from D25: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\nAdd the number \"0\" for 'Qty / per' start from E.\nBefore Price: Apply the \"=SUM(D25*$F$4)\" from D25 at column\" Before Price\"\nAfter Price: Apply the \"=SUM(I25*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "15",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J25:J29 to 0 for “After Price”."
      },
      {
        "number": "16",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\nInsert the text: “Total Supplementary:\" in cell A39. Insert the text: “Total Whole House Price with Supplementary Items\" in the next row.\nCreate the total for \"Supplementary\" row 30 Column F: Column J with the calculation F25: F38"
      },
      {
        "number": "17",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\nCreate the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F: Column I with the calculation \"=F21+F39\", for Column G with the calculation \"=G21+G39\", for Column I with the calculation = \"I21+I39\", and for Column J with the calculation = \"J21+J39\"."
      },
      {
        "number": "18",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW\n-Check which total quotation is the lowest (The second prompt is recommended)\n-Insert the formula in cell H4 \"=sum (row 40 the lower price/ F4)\"//\n-Insert the formula in cell H4 \"=J40/$F$4\""
      },
      {
        "number": "19",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE\nCompare all the prices in the row 40, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "20",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\nUpdated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\nUpdated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\nUpdated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "21",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\nUpdated column A by replacing all instances of the text 配套品表 with Accessories Table.\nUpdated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "22",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\nUpdated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\nUpdated column A and column B by replacing all instances of the text 书房with书房//Study Room\nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "23",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\nPlease update Column A and column B based on these rules:\nFind: 主卧房\nReplace with: 主卧房//Master Bedroom"
      },
      {
        "number": "24",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\nUpdated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\nUpdated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "25",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\nUpdated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\nUpdated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "26",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\nUpdated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\nUpdated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "27",
        "category": "TRANSLATE 3RD HEADING:",
        "text": "TRANSLATE 3RD HEADING:\nUpdated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\nUpdated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\nUpdated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\nUpdated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "28",
        "category": "TRANSLATE THE LAST UPDATED:",
        "text": "TRANSLATE THE LAST UPDATED:\nUpdated column C by replacing all instances of the text 经手人 with Handle by.\nUpdated column C by replacing all instances of the text 顾客签名 with.\nUpdated the text \"Date\" by replacing all instances of the text 日期."
      },
      {
        "number": "29",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "30",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "31",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\nFrom column I36=IF(REGEXMATCH(H,\"BeforePrice\"),\n\"=IF (ISNUMBER (\"1\"), H36*(1-$I$2))\".\n\nColumn I39:I117\"=IF (ISBLANK (H39,\"1\"), H39*(1-$I$2))\", \nIgnore text \"After Price\" and enter only numbers with the formula in the cell.\n\nColumn I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\")\n\nApply in column I, =IF (H=\"Before Price”, “After Price). \nApply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\napply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "32",
        "category": "RENAME",
        "text": "RENAME\n(These prompts have to run one after another if not they will mess up and result with not be correct.)\nFor Column H,\nStarting from cell H44 for entire Column H rename all the cells with the word \"Price\" in Column H to \"Software Price\".\n\nFor Column I,\nStarting from cell I44 for entire Column I rename all the cells with the word \"Price\" in Column I to \"Before Price\".\n\nFor Column J,\nStarting from cell J44 for entire Column J rename all the cells with the word \"Price\" in Column J to \"After Price\".\n\nCONVERSION\nFrom cells I45 to I222, apply this formula \"H(correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n//\nFrom cells I45 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "33",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J45 to J222, apply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n//\nFrom cells J45 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I (Correspondence*I$2, \"\")\", ignore the cells with the texts \"After Price\".\nM&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "34",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "35",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\nAdd the text in cell E212 Supply and install flat Plaster Ceiling and finish with ceiling painting                                     \nSupply and install Lighting Point, 13A point with Schneider avatar on up to 25 units                              \nSupply and install eyeball 7w megaman bulb\nfitting up to 15 units                                                  \nSupply and install Osram LED T5 up to 25 units                                      \nSupply and install switches up to 5 units and doorbell up to 1 unit                                 \nRelocate to other side of the wall if needed, install fan and lighting accessory\nAdd the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\nAdd the text in cell E128: Living room, master bedroom and small room Curtain: Dimmer collection Width: 300cm                \nComposition: 100% polyster.                       \nSheer:  Width 320cm with lead band           \nComposition: 100% polyster"
      },
      {
        "number": "36",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "37",
        "category": "",
        "text": "BY MANUAL WORK:\n Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "38",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. \nAnd merge the cells with vertically"
      },
      {
        "number": "39",
        "category": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and",
        "text": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details  \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow , if any changes during the production will subject to additional surcharge. \n④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        备注： \n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 ②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      },
      {
        "number": "40",
        "category": "Delete the row with this word \"活动金额优惠价\"。",
        "text": "Delete the row with this word \"活动金额优惠价\"。"
      }
    ]
  },
  {
    "areaNumber": 9,
    "label": "Area 9 — 9 real rooms — 42 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "CHANGE THE TOP HEADINGS PROMPT:",
        "text": "CHANGE THE TOP HEADINGS PROMPT:\n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column).\n-Update the cell E1 to: MOCOF Whole House Quotation\n-Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\nRename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nF to \"RM49800\"\nContinue renamed the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft.\nFill in Client Information: Enter “CustomerName” in cell F2, Enter “PropertyNamein cell F3, Enter “sqft” in cell F4 (Text only, no formula required.)\n\nClear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. Keep the cells as they are, just remove the text and numbers so they are empty.\n\nInsert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\nInsert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3.\nInsert the text \"RM/sqft\" at cell G4.\n(Remember to check the currency in design website)"
      },
      {
        "number": "3",
        "category": "ADD THE DISCOUNT PERCENTAGE:",
        "text": "ADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "4",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G16."
      },
      {
        "number": "5",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\nInsert 6 row below row 15. \nAdd the text as following to B16: B21 Extra m2, Curve, Wall Panel\nContinue add the text as following: Aluminum Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "6",
        "category": "(Project no need put deduct design fee)",
        "text": "(Project no need put deduct design fee)"
      },
      {
        "number": "7",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\nAdd a sequential row number for 'Whole House Total' starting from 1 at column A7 to “Deduct Design fee.\"."
      },
      {
        "number": "8",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:\nCreate the total for \"Whole Hose Total\" RM49800 total (F14): RM79800 Total (G14) with the calculation = (F7:F21) +49800 or 79800\n\nCreate a formula in cell D Total: E Total with the calculation D7: D21)\nCreate a formula in cell H total: I Total with the calculation D7: D20)"
      },
      {
        "number": "9",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F16 with extra m2. =sum (E total-20) *1999\nApply the formula in cell G16 with extra m2. =sum (E total-24) *1999\nApply the formula in cell G18 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "10",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:\nIf F4 less than 1500, then the “Deduct Design Fee” for cell F21, cell G21, and cell J21 will become \"-1500\". \nIf F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F21, cell G21, and cell J21 will become \"-2000\".  \nIf F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F21, cell G21, and cell J21 will become \"-3500\".  \nIf F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F21, cell G21, and cell J21 will become \"-6000\"."
      },
      {
        "number": "11",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7: I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "12",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 23\nAdd the text \"Supplementary\" in cell A24\nAdd a sequential row number for 'Supplementary' starting from 1 to 14 at column A26."
      },
      {
        "number": "13",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 25: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "14",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B26 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint with 3 color nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "15",
        "category": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:",
        "text": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "16",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number as followings start from D26: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\nAdd the number \"0\" for 'Qty / per' start from E.\nBefore Price: Apply the \"=SUM(D26*$F$4)\" from D26 at column\" Before Price\"\nAfter Price: Apply the \"=SUM(I26*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "17",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J26:J29 to 0 for “After Price”."
      },
      {
        "number": "18",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\nInsert the text: “Total Supplementary:\" in cell A40. \n\nInsert the text: “Total Whole House Price with Supplementary Items\" in the next row.\n\nCreate the total for \"Supplementary\" row 30 Column F: Column J with the calculation F26: F39"
      },
      {
        "number": "19",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABL",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\n-Create the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F with the calculation \"=F22+F40\", \nfor column G with the calculation =\"G22+G40\", for Column I with the calculation = \"I22+I40”, and for Column J with the calculation = \"J22+J40\"."
      },
      {
        "number": "20",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW\n-Check which total quotation is the lowest\nInsert the formula in cell H4 \"=sum (row 41 the lower price/ F4)\"//\nInsert the formula in cell H4 \"=J41/F4\""
      },
      {
        "number": "21",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE\nCompare all the prices in the row 41, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "22",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\nUpdated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\nUpdated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\nUpdated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "23",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\nUpdated column A by replacing all instances of the text 配套品表 with Accessories Table.\nUpdated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "24",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\nUpdated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\nUpdated column A and column B by replacing all instances of the text 书房with书房//Study Room\nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "25",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\nPlease update Column A and column B based on these rules:\nFind: 主卧房\nReplace with: 主卧房//Master Bedroom"
      },
      {
        "number": "26",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\nUpdated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\nUpdated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "27",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\nUpdated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\nUpdated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "28",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\nUpdated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\nUpdated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "29",
        "category": "TRANSLATE 3RD HEADING:",
        "text": "TRANSLATE 3RD HEADING:\nUpdated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\nUpdated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\nUpdated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\nUpdated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "30",
        "category": "TRANSLATE THE LAST UPDATED:",
        "text": "TRANSLATE THE LAST UPDATED:\nUpdated column C by replacing all instances of the text 经手人 with Handle by.\nUpdated column C by replacing all instances of the text 顾客签名 with.\nUpdated the text \"Date\" by replacing all instances of the text 日期."
      },
      {
        "number": "31",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "32",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "33",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\nFrom column I36=IF (REGEXMATCH (H,\"Before Price\"),\"=IF (ISNUMBER (\"1\"), H36*(1-$I$2))\".\n\nColumn I39:I117\"=IF(ISBLANK(H39,\"1\"), H39*(1-$I$2))\", \nIgnore text \"After Price\" and enter only numbers with the formula in the cell.\n\nColumn I40:I141=IF (REGEXMATCH (H40,\"Before Price\"), \"After Price\")\n\nApply in column I, =IF (H=\"Before Price”, “After Price). Apply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\n\napply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "34",
        "category": "RENAME",
        "text": "RENAME\n(These prompts must run one after another if not they will mess up and result with not be correct.)\n\nFor Column H,\nStarting from cell H45 rename all the cells with the word \"Price\" in Column H to \"Software Price\".\n\nFor Column I,\nStarting from cell I45 rename all the cells with the word \"Price\" in Column I to \"Before Price\".\n\nFor Column J,\nStarting from cell J45 rename all the cells with the word \"Price\" in Column J to \"After Price\".\n\nCONVERSION\nFrom cells I46 to I222, apply this formula \"H (correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n//\nFrom cells I46 to I222, apply this formula \"IF (ISNUMBER (H (Correspondence Cell), H (Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "35",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J46 to J222, apply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n//\nFrom cells J46 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I (Correspondence*I$2, \"\")\", ignore the cells with the texts \"After Price\".\nM&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "36",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "37",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\nAdd the text in cell E212 Supply and install flat Plaster Ceiling and finish with ceiling painting                                     \n-Supply and install Lighting Point, 13A point with Schneider avatar on up to 25 units                              \n-Supply and install eyeball 7w megaman bulb\nfitting up to 15 units                                                  \n-Supply and install Osram LED T5 up to 25 units                                      \n-Supply and install switches up to 5 units and doorbell up to 1 unit                                 \n-Relocate to other side of the wall if needed, install fan and lighting accessory\nAdd the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\nAdd the text in cell E128: Living room, master bedroom and small room  Curtain : Dimmer collection Width : 300cm                \nComposition: 100% polyster.                       \nSheer:  Width 320cm with lead band           \nComposition: 100% polyster"
      },
      {
        "number": "38",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "39",
        "category": "",
        "text": "BY MANUAL WORK:\n Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "40",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. And merge the cells with vertically"
      },
      {
        "number": "41",
        "category": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and",
        "text": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details  \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow, if any changes during the production will subject to additional surcharge. \n④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        备注：\n①本报价自发出之日起两周内有效，并作为合同补充条款的一部分②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      },
      {
        "number": "42",
        "category": "Delete the row with this word \"活动金额优惠价\"。",
        "text": "Delete the row with this word \"活动金额优惠价\"。"
      }
    ]
  },
  {
    "areaNumber": 10,
    "label": "Area 10 — 10 real rooms — 42 exact documented prompts",
    "prompts": [
      {
        "number": "1",
        "category": "\\\\CHANGE THE TOP HEADINGS PROMPT:",
        "text": "\\\\CHANGE THE TOP HEADINGS PROMPT:\n-Copy all content from Column H to Column I and Column J, from top to bottom (the entire column).\n-Update the cell E1 to: MOCOF Whole House Quotation\n-Updated the text in cell A5, by replacing the text from '全屋汇总' to 'Whole House Total'"
      },
      {
        "number": "2",
        "category": "CHANGE THE TITLE PROMPT:",
        "text": "CHANGE THE TITLE PROMPT:\nRename the text as follow in row 6: A renamed to \"No.\"\nB to \"Space\"\nD to \"Wall Panel (m²)\"\nE to \"Cabinet (m²)\"\nContinue renamed the the followings:\nF to \"RM49800\"\nG to \"RM79800\"\nH to \"Software Price\"\nI renamed to \"Before Price\"\nJ renamed to \"After Price\"\n_____________________________________________________________________________\nFILL IN THE CUSTOMER DETAILS:\n⁠Rename the cells (E2:E4), in order, as follows: Customer Name, Address, Sqft.\n\nFill in Client Information: Enter “CustomerName” in cell F2, Enter “PropertyNamein cell F3, Enter “sqft” in cell F4 (Text only, no formula required.)\n\nClear all contents and values in the range G2:G4, H2:H4, I2:I4, J2:J4. Keep the cells as they are, just remove the text and numbers so they are empty.\n\nInsert the text \"Currency\" at cell G2 and Insert \"6.88\" at cell H2.\nInsert the text \"Budget\" at cell G3 and Insert CustomerBudget at cell H3.\nInsert the text \"RM/sqft\" at cell G4.\n(Remember to check the currency in design website)"
      },
      {
        "number": "3",
        "category": "ADD THE DISCOUNT PERCENTAGE:",
        "text": "ADD THE DISCOUNT PERCENTAGE:\nInsert 90% at cell I2, as scientific and 2 decimal places."
      },
      {
        "number": "4",
        "category": "CLEAR THE CONTENT:",
        "text": "CLEAR THE CONTENT: \nClear all contents and values in the range D7:G17."
      },
      {
        "number": "5",
        "category": "INSERT EXTRA:",
        "text": "INSERT EXTRA:\nInsert 6 row below row 16. \nAdd the text as following to B17: B22 Extra m2, Curve, Wall Panel\nContinue add the text as following: Aluminum Frame, Add-on finishing, and Deduct Design fee."
      },
      {
        "number": "6",
        "category": "(Project no need put deduct design fee)",
        "text": "(Project no need put deduct design fee)"
      },
      {
        "number": "7",
        "category": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:",
        "text": "ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE:\nAdd a sequential row number for 'Whole House Total' starting from 1 at column A7 to “Deduct Design fee.\"."
      },
      {
        "number": "8",
        "category": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"WHOLE HOUSE TOTL\" TABLE:\nCreate the total for \"Whole Hose Total\" RM49800 total (F14): RM79800 Total (G14) with the calculation = (F7:F22) +49800 or 79800\nCreate a formula in cell D Total: E Total with the calculation D7: D22)\nCreate a formula in cell H total: I Total with the calculation D7: D21)"
      },
      {
        "number": "9",
        "category": "APPLY THE PACKAGES FORMULA:",
        "text": "APPLY THE PACKAGES FORMULA: \nApply the formula in cell F17 with extra m2. =sum (E total-20) *1999\nApply the formula in cell G17 with extra m2. =sum (E total-24) *1999\nApply the formula in cell G19 with Wall Panel. =sum (D total-6) *650"
      },
      {
        "number": "10",
        "category": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:",
        "text": "ADD THE \"DEDUCT DESIGN FEE\" FORMULA:\nIf F4 less than 1500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-1500\". \nIf F4 between 1501 to 2000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-2000\".  \nIf F4 between 2001 to 2500, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-3500\".  \nIf F4 between 2501 to 3000, then the “Deduct Design Fee” for cell F, cell G, and cell J will become \"-6000\"."
      },
      {
        "number": "11",
        "category": "Currency",
        "text": "Currency \n19. Apply the Currency for F7: I (_) with \"RM\"\n20. Apply the currency to the total range from 49800 to After Price with \"RM\"."
      },
      {
        "number": "12",
        "category": "SUPPLEMENTARY TABLE:",
        "text": "SUPPLEMENTARY TABLE:\nInsert 19 row below row 24\nAdd the text \"Supplementary\" in cell A25\nAdd a sequential row number for 'Supplementary' starting from 1 at column A27."
      },
      {
        "number": "13",
        "category": "Insert the TEXT",
        "text": "Insert the TEXT\nInsert the text as follow in row 26: A to \"No\"\nB to \"Name\"\nD to \"sqft / per\"\nE to \"Qty / per\"\nF to \"RM49800\"\nContinue Insert the followings:\nG to \"RM79800\"\nH to \"Software Price\"\nI to \"Before Price\"\nJ to \"After Price\""
      },
      {
        "number": "14",
        "category": "ADD THE NAME OF CONTENT:",
        "text": "ADD THE NAME OF CONTENT:\nStart from B27 Defect Check before start work 3D & 2D design and submission Project management Post reno cleaning Floor Protection (Floor guard) Electrical Plaster ceiling Painting with white paint with 3 color nippon colors Partition (normal w/o sounds proof) Curtain with Blind per window H 8-9ft Hacking & Removal Grout Mirror"
      },
      {
        "number": "15",
        "category": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:",
        "text": "INSERT THE SUPPLEMENTARY DISCOUNT RATE:\nInsert 80% at cell I3, as scientific and 2 decimal places."
      },
      {
        "number": "16",
        "category": "INSERT THE CONTENT AND FORMULA:",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number as followings start from D27: 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.50, 50\nAdd the number \"0\" for 'Qty / per' start from E.\nBefore Price: Apply the \"=SUM(D27*$F$4)\" from D27 at column\" Before Price\"\nAfter Price: Apply the \"=SUM(I27*I3)\" at column J at column\" After Price\""
      },
      {
        "number": "17",
        "category": "49800 & 79800 = AFTER PRICE:",
        "text": "49800 & 79800 = AFTER PRICE:\nColumn F \"RM49800\" = column J \"After Price\" \nColumn G \"RM79800\" = column J \"After Price\"\nSet the values in J27:J31 to 0 for “After Price”."
      },
      {
        "number": "18",
        "category": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:",
        "text": "CREATE TOTAL PRICE FOR \"SUPPLEMENTARY\" TABLE:\nInsert the text: “Total Supplementary:\" in cell A41. Insert the text: “Total Whole House Price with Supplementary Items\" in the next row.\nCreate the total for \"Supplementary\" row 30 Column F: Column J with the calculation F27: F40"
      },
      {
        "number": "19",
        "category": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE",
        "text": "CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY PRICE FOR \"SUPPLEMENTARY\" TABLE:\nCreate the \"Total Whole House Price with Supplementary Items\" for \"Supplementary\" Column F with the calculation \"=F23+F41\", for Column I with the calculation = \"I23+I41\", and for Column J with the calculation = \"J23+J41\"."
      },
      {
        "number": "20",
        "category": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW",
        "text": "INSERT THE (UNIT/PRICE) FOR PRICE REASONABLENESS REVIEW—Check which total quotation is the lowest\nInsert the formula in cell H4 \"=sum (row 43 the lower price/ F4)\"//\nInsert the formula in cell H4 \"=J43/F4\""
      },
      {
        "number": "21",
        "category": "HIGHLIGHT THE CHEAPEST PRICE",
        "text": "HIGHLIGHT THE CHEAPEST PRICE\nCompare all the prices in the row 40, total price row: including all 4 prices, then highlight the lowest price with the green color"
      },
      {
        "number": "22",
        "category": "TRANSLATE THE HEADING / WORD",
        "text": "TRANSLATE THE HEADING / WORD\nTRANSLATE THE TOTAL:\nUpdated column A by replacing all instances of the text 柜体合计 with Cabinet Total Price.\nUpdated column A by replacing all instances of the text 配套品合计 with Accessories Total Price.\nUpdated column A by replacing all instances of the text 合计 with Total Price."
      },
      {
        "number": "23",
        "category": "TRANSLATE THE SMALL TABLE:",
        "text": "TRANSLATE THE SMALL TABLE:\nUpdated column A by replacing all instances of the text 配套品表 with Accessories Table.\nUpdated column A by replacing all instances of the text 柜体表 with Cabinet Table."
      },
      {
        "number": "24",
        "category": "TRANSLATE TABLE 1ST HEADING:",
        "text": "TRANSLATE TABLE 1ST HEADING:\nUpdated column A and column B by replacing all instances of the text 客卧房 with 客卧房//Guest Bedroom\nUpdated column A and column B by replacing all instances of the text 书房with书房//Study Room\nUpdated column A and column B by replacing all instances of the text 客餐厅with 客餐厅//Living and Dining Room"
      },
      {
        "number": "25",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text 门厅with 门厅//Foyer.\nPlease update Column A and column B based on these rules:\nFind: 主卧房\nReplace with: 主卧房//Master Bedroom"
      },
      {
        "number": "26",
        "category": "**TRANSLATE TABLE 1ST HEADING",
        "text": "**TRANSLATE TABLE 1ST HEADING\nUpdated column A and column B by replacing all instances of the text厨房 with 厨房//Kitchen\nUpdated column A and column B by replacing all instances of the text with 多功能空间 with 多功能空间//Multipurpose Room\nUpdated column A and column B by replacing all instances of the text 儿童房with儿童房//Kids Room"
      },
      {
        "number": "27",
        "category": "TRANSLATE TABLE 2ND HEADING:",
        "text": "TRANSLATE TABLE 2ND HEADING:\nUpdated column A to column B by replacing all instances of the text 序号with No; and 产品图片 with Product PIC.\nUpdated column C to column D by replacing all instances of the text 组合 with Combi; and 名称 with Name."
      },
      {
        "number": "28",
        "category": "**TRANSLATE TABLE 2ND HEADING:",
        "text": "**TRANSLATE TABLE 2ND HEADING:\nUpdated column E to column F by replacing all instances of the text 型号 with Model; and 宽深高 with WDH.\nUpdated column G to column H by replacing all instances of the text 数量with Qty; and 单价 with Before Price."
      },
      {
        "number": "29",
        "category": "TRANSLATE 3RD HEADING:",
        "text": "TRANSLATE 3RD HEADING:\nUpdated column C by replacing all instances of the text 23系统柜 with 23 system cabinet.\nUpdated column C by replacing all instances of the text 25厨柜 with 25 Kitchen Cabinet.\nUpdated column C by replacing all instances of the text 美家背景墙 with Background Wall Panel.\nUpdated column C by replacing all instances of the text 新居产品 with New Product."
      },
      {
        "number": "30",
        "category": "TRANSLATE THE LAST UPDATED:",
        "text": "TRANSLATE THE LAST UPDATED:\nUpdated column C by replacing all instances of the text 经手人 with Handle by.\nUpdated column C by replacing all instances of the text 顾客签名 with.\nUpdated the text \"Date\" by replacing all instances of the text 日期."
      },
      {
        "number": "31",
        "category": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:",
        "text": "CONNECT THE WHOLE HOUSE TOTAL WITH EACH TABLE:\nH7 represents the total price for the Guest Bedroom (客卧房).\nH8 represents the total price for the Kids Room (儿童房).\nH9 represents the total price for the Master Bedroom (主卧房).\nH10 represents the total price for the Living and Dining Room (客餐厅)."
      },
      {
        "number": "32",
        "category": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:",
        "text": "CREATE THE CABINET TOTAL & ACCESSORIES TOTAL TABLE:\nCreate the Cabinet Total Price for Column H with formula: H54=sum(H39:53) and Accessories Total Price: H110=sum (H108:H109)."
      },
      {
        "number": "33",
        "category": "Apply the \"After Price\", & \"Discount Price\" Formula:",
        "text": "Apply the \"After Price\", & \"Discount Price\" Formula:\nFrom column I36=IF(REGEXMATCH(H,\"Before Price\"),\"=IF(ISNUMBER (\"1\"), H36*(1-$I$2))\".\nColumn I39:I117\"=IF(ISBLANK(H39,\"1\"),H39*(1-$I$2))\", Ignore text \"After Price\" and enter only numbers with the formula in the cell.\nColumn I40:I141=IF( REGEXMATCH(H40,\"Before Price\"), \"After Price\")\nApply in column I, =IF (H=\"Before Price”, “After Price). Apply to column I from I36 =IF(H36,\"1\",\"'1'*(1-$I$2))\".\napply this formula to column I40:I141 \"=IF (H2=\"Before price\", \"after price\", \"\")\""
      },
      {
        "number": "34",
        "category": "RENAME",
        "text": "RENAME\n(These prompts have to run one after another if not they will mess up and result with not be correct.)\nFor Column H,\nStarting from cell H46 rename all the cells with the word \"Price\" in Column H to \"Software Price\".\n\nFor Column I,\nStarting from cell I46 rename all the cells with the word \"Price\" in Column I to \"Before Price\".\n\nFor Column J,\nStarting from cell J46 rename all the cells with the word \"Price\" in Column J to \"After Price\".\n\nCONVERSION\nFrom cells I47 to I222, apply this formula \"H(correspondence cell) * H2 \", ignore the cells with the texts \"Price\" and \"Before price\". \n//\nFrom cells I47 to I222, apply this formula \"IF(ISNUMBER(H (Correspondence Cell), H(Correspondence*H$2, \"\")\", ignore the cells with the texts \"Before Price\"."
      },
      {
        "number": "35",
        "category": "DISCOUNT",
        "text": "DISCOUNT\nFrom cells J47 to J222, apply this formula \"I (correspondence cell) * I2\", ignore the cells with the texts \"Price\" and \"After Price\". \n//\nFrom cells J47 to J222, apply this formula \"IF (ISNUMBER (I (Correspondence Cell), I(Correspondence*I$2, \"\")\", \nignore the cells with the texts \"After Price\".\n\nM&E Work & Curtain Table\nInsert 11 row below row 119\nAdd the text \"M&E Work\" in cell A120\nAdd the text \"Curtain\" in cell D128"
      },
      {
        "number": "36",
        "category": "Insert the Text",
        "text": "Insert the Text\nInsert the text as follow in row 121 and 126: \nA to \"No\"\nD to \"Name\"\nE to \"Model\"\nG to \"Qty\""
      },
      {
        "number": "37",
        "category": "ADD THE CONTENT:",
        "text": "ADD THE CONTENT:\nAdd the text in cell E212 Supply and install flat Plaster Ceiling and finish with ceiling painting                                     \nSupply and install Lighting Point, 13A point with Schneider avatar on up to 25 units                              \nSupply and install eyeball 7w megaman bulb\nfitting up to 15 units                                                  \nSupply and install Osram LED T5 up to 25 units                                      \nSupply and install switches up to 5 units and doorbell up to 1 unit                                 \nRelocate to other side of the wall if needed, install fan and lighting accessory\nAdd the text next row: Wall plug and switches, eyeball 7w megaman bulb, Osram LED T5, fan\nAdd the text in cell E128: Living room, master bedroom and small room Curtain: Dimmer collection Width: 300cm                \nComposition: 100% polyster.                      \nSheer:  Width 320cm with lead band          \nComposition: 100% polyster"
      },
      {
        "number": "38",
        "category": "INSERT THE CONTENT AND FORMULA",
        "text": "INSERT THE CONTENT AND FORMULA:\nAdd the number for \"Qty\" column with \"1\"\nAdd the name \"Electrical and Plaster work\" in D122\nAdd the name \"Curtain\" in D128"
      },
      {
        "number": "39",
        "category": "",
        "text": "BY MANUAL WORK:\n Insert this Logo in cells A1: D4 by manually"
      },
      {
        "number": "40",
        "category": "36. Merge the cells with horizontally. And merge the cells with vertically",
        "text": "36. Merge the cells with horizontally. And merge the cells with vertically"
      },
      {
        "number": "41",
        "category": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and",
        "text": "'Remark: ①This quotation is valid within 2 weeks on the date it was send out and serve as part of the supplementary contract details  \n②Customer agree to purchase Mocof products and accessories based on the specifications stated. All productions will be carried out based on the signed documents. Any material and specifications changes must be signed to be deemed valid.                                                                                                                          ③All products are custom made to order and once signed and proceed into production, there will be no changes allow, if any changes during the production will subject to additional surcharge. \n④All materials provided are of at least 18mm or 25mm thickness in plywood, mdf or particle board based on the finishing chosen and with at least E0 or ENF grade.                                        \n备注：①本报价自发出之日起两周内有效，并作为合同补充条款的一部分。 \n②客户同意按照所述规格购买Mocof产品及配件。所有生产将以签署的文件为依据，任何材料及规格的变更须经签署方为有效。 \n③所有产品均为定制生产，一旦签署并进入生产流程，不得更改。若在生产过程中提出变更，将产生额外费用。 \n④所有提供的材料均采用至少18mm或25mm厚度的胶合板、中密度纤维板或颗粒板（根据所选饰面而定），并符合至少E0或ENF环保等级。'"
      },
      {
        "number": "42",
        "category": "Delete the row with this word \"活动金额优惠价\"。",
        "text": "Delete the row with this word \"活动金额优惠价\"。"
      }
    ]
  }
];

export function getDocumentedAreaPrompts(areaNumber?: number): DocumentedAreaPromptSet | undefined {
  return DOCUMENTED_AREA_PROMPTS.find((area) => area.areaNumber === areaNumber);
}
