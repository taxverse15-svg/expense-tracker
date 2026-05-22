/**
 * WICASA Expense Tracker — Google Apps Script backend
 *
 * Deploy: Deploy → New deployment → Web app
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Fix applied: use spreadsheet ID only, not the full URL.
 */

const SPREADSHEET_ID = "1FIDEr8TIeVhIqYWS_ld8sEqWxll0d4DvlJGSzRCFaVQ";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    let driveFileUrl = "";
    if (data.billLink && data.folderId && data.fileName) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(data.billLink),
        guessMimeType_(data.fileName),
        data.fileName
      );
      const file = DriveApp.getFolderById(data.folderId).createFile(blob);
      driveFileUrl = file.getUrl();
    }

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.amount || "",
      data.description || "",
      data.fileName || "",
      driveFileUrl,
      "Pending",
    ]);

    return jsonResponse_({ success: true });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

function doGet() {
  return jsonResponse_({ success: true, status: "ok" });
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
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
