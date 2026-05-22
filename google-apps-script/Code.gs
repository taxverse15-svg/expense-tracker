/**
 * WICASA Expense Tracker — Google Apps Script backend
 *
 * Deploy: Deploy → New deployment → Web app
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Paste this entire file into Apps Script, then deploy a new version.
 */

const SPREADSHEET_ID = "1FIDEr8TIeVhIqYWS_ld8sEqWxll0d4DvlJGSzRCFaVQ";

const MEMBER_FOLDERS = {
  "Aman Upadhyay": "1nvyKviniAY_c4FMTk7o7oqFpFaUy_4MK",
  "Avinash Revgade": "1cnxPIS4bx4YNLHy6Lv62No44-Yhb7zyu",
  "Ayush Chauhan": "1zO6LQe-u_KyynV_v-BQBQG1ifamAZ2hN",
  "Dhiraj Wadhwani": "19wSRBBOfEW95rZI43Mw2rv29ehrZvUNL",
  "Dhwani Savla": "1Wor4LHeRcElZ6lwSHVsIO4ERfG1JY1hW",
  "Hardik Kothari": "1qmRBROFVJMIgIzR7_FwBzo3wbOcOWfep",
  "Hitesh Ramnani": "1n4ZmiwNkCmSFzB99pURK7xh4jZP5XEZ7",
  "Kundan Parasramka": "1G3KWbFqbVvE_8OUW0hWgkDgdZ-kTKUSU",
  "Piyush Kadav": "1hwFuQnCbXdwwqX_JiKKU4KKHnVlHMiup",
  "Pratik Ojha": "1a1bMKrKhvS326TIdVHCmcHn_iDrD1z-u",
  "Soham Ranshur": "1bzUh88_2hRRWAKTLuOvH57ey2bjvgJe2",
  "Sumit Gupta": "194z_DyDj11qZzjO6LmhqUUX_apCOfh7Z",
  "Vivek Patel": "1bP3rYT6Zo5ZEyEwC9uJtrav-iVUIKQBd",
};

// Sheet columns: Timestamp | Name | Amount | Description | Receipt File | Drive Link | Status
const SHEET_HEADERS = [
  "Timestamp",
  "Name",
  "Amount",
  "Description",
  "Receipt File",
  "Drive Link",
  "Status",
];

function doPost(e) {
  try {
    const rawBody = e.postData ? e.postData.contents || e.postData.getDataAsString() : "";
    const data = JSON.parse(rawBody || "{}");
    const sheet = getSheet_();

    const memberName = (data.name || "").trim();
    const folderId = MEMBER_FOLDERS[memberName] || (data.folderId || "").trim();

    if (!memberName) {
      throw new Error("Member name is required.");
    }

    let driveFileUrl = "";
    let driveFileName = "";

    const base64Input = data.receiptBase64 || data.billLink || "";
    if (base64Input) {
      if (!folderId) {
        throw new Error(
          "No Drive folder mapped for member: " + memberName + ". Check MEMBER_FOLDERS."
        );
      }

      driveFileName = buildReceiptFileName_(memberName, data.fileName);
      const mimeType = data.mimeType || guessMimeType_(driveFileName);
      const bytes = Utilities.base64Decode(normalizeBase64_(base64Input));
      const blob = Utilities.newBlob(bytes, mimeType, driveFileName);
      const folder = DriveApp.getFolderById(folderId);
      const file = folder.createFile(blob);

      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveFileUrl = file.getUrl();
    }

    const timestamp = new Date();
    sheet.appendRow([
      timestamp,
      memberName,
      data.amount || "",
      data.description || "",
      driveFileName,
      driveFileUrl,
      "Pending",
    ]);

    const row = sheet.getLastRow();
    if (driveFileUrl) {
      sheet
        .getRange(row, 6)
        .setFormula('=HYPERLINK("' + driveFileUrl + '","View Receipt")');
    }

    return jsonResponse_({
      success: true,
      driveFileUrl: driveFileUrl,
      fileName: driveFileName,
    });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

function doGet() {
  return jsonResponse_({ success: true, status: "ok" });
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
  }
  return sheet;
}

function normalizeBase64_(input) {
  let value = String(input || "").trim();
  const dataUrlMatch = value.match(/^data:[^;]+;base64,(.+)$/i);
  if (dataUrlMatch) {
    value = dataUrlMatch[1];
  }
  value = value.replace(/\s/g, "");
  const padding = value.length % 4;
  if (padding) {
    value += "=".repeat(4 - padding);
  }
  return value;
}

function buildReceiptFileName_(memberName, originalName) {
  const safeMember = memberName.replace(/[^\w]+/g, "_");
  const ext = (originalName && originalName.includes("."))
    ? originalName.slice(originalName.lastIndexOf("."))
    : ".jpg";
  const base = originalName
    ? originalName.replace(/\.[^/.]+$/, "").replace(/[^\w.-]+/g, "_")
    : "receipt";
  return safeMember + "_" + base + "_" + new Date().getTime() + ext;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function guessMimeType_(fileName) {
  const lower = (fileName || "").toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "image/jpeg";
}
