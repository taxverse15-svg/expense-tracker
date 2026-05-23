/**
 * WICASA Expense Tracker — paste ALL of this into Apps Script Code.gs
 * Deploy → New version → Web app (Execute as: Me, Anyone can access)
 *
 * Sheet layout (your existing columns):
 *   A: Name | B: Amount | C: Bill Link | D: Status | E: Date | F: Description
 */

const SPREADSHEET_ID = "1FIDEr8TIeVhIqYWS_ld8sEqWxll0d4DvlJGSzRCFaVQ";

/** Exact folder IDs — do not create new folders */
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

function doPost(e) {
  try {
    const rawBody = e.postData ? e.postData.contents || e.postData.getDataAsString() : "";
    const data = JSON.parse(rawBody || "{}");

    const memberName = String(data.name || "").trim();
    if (!memberName) {
      throw new Error("Member name is required.");
    }

    const folderId = MEMBER_FOLDERS[memberName];
    if (!folderId) {
      throw new Error("No Drive folder mapped for: " + memberName);
    }

    if (data.folderId && String(data.folderId).trim() !== folderId) {
      throw new Error("Selected member does not match the submitted Drive folder.");
    }

    const base64Input = data.receiptBase64 || data.billLink || "";
    if (!base64Input) {
      throw new Error("Receipt image (base64) is required.");
    }

    const driveFile = uploadReceiptToMemberFolder_(
      memberName,
      folderId,
      base64Input,
      data.fileName,
      data.mimeType
    );

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    ensureDescriptionHeader_(sheet);

    // Match your sheet: Name | Amount | Bill Link | Status | Date | Description
    sheet.appendRow([
      memberName,
      data.amount || "",
      driveFile.url,
      "Pending",
      new Date(),
      data.description || "",
    ]);

    const row = sheet.getLastRow();
    sheet
      .getRange(row, 3)
      .setFormula('=HYPERLINK("' + driveFile.url + '","View Receipt")');

    return jsonResponse_({
      success: true,
      driveFileUrl: driveFile.url,
      driveFileId: driveFile.id,
      fileName: driveFile.name,
      folderId: folderId,
    });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

function doGet() {
  return jsonResponse_({ success: true, status: "ok", version: 4 });
}

/**
 * Decode base64 → blob → create file in member's existing Drive folder.
 */
function uploadReceiptToMemberFolder_(memberName, folderId, base64Input, fileName, mimeType) {
  const decodedName = buildReceiptFileName_(memberName, fileName);
  const resolvedMime = mimeType || guessMimeType_(decodedName);
  const bytes = Utilities.base64Decode(normalizeBase64_(base64Input));
  const blob = Utilities.newBlob(bytes, resolvedMime, decodedName);

  let folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    throw new Error(
      "Cannot open Drive folder for " +
        memberName +
        ". Share the folder with the script owner account."
    );
  }

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    id: file.getId(),
    url: file.getUrl(),
    name: file.getName(),
  };
}

function ensureDescriptionHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Name", "Amount", "Bill Link", "Status", "Date", "Description"]);
    return;
  }
  const colF = sheet.getRange(1, 6).getValue();
  if (!colF || String(colF).toLowerCase() !== "description") {
    sheet.getRange(1, 6).setValue("Description");
  }
}

function normalizeBase64_(input) {
  var value = String(input || "").trim();
  var match = value.match(/^data:[^;]+;base64,(.+)$/i);
  if (match) {
    value = match[1];
  }
  value = value.replace(/\s/g, "");
  var pad = value.length % 4;
  if (pad) {
    value += "====".substring(0, 4 - pad);
  }
  return value;
}

function buildReceiptFileName_(memberName, originalName) {
  var safeMember = memberName.replace(/[^\w]+/g, "_");
  var stamp = new Date().getTime();
  if (originalName) {
    var clean = String(originalName).replace(/[^\w.\-]+/g, "_");
    return safeMember + "_receipt_" + stamp + "_" + clean;
  }
  return safeMember + "_receipt_" + stamp + ".jpg";
}

function guessMimeType_(fileName) {
  var lower = String(fileName || "").toLowerCase();
  if (lower.indexOf(".webp") !== -1) return "image/webp";
  if (lower.indexOf(".png") !== -1) return "image/png";
  if (lower.indexOf(".pdf") !== -1) return "application/pdf";
  if (lower.indexOf(".jpg") !== -1 || lower.indexOf(".jpeg") !== -1) return "image/jpeg";
  return "image/jpeg";
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
