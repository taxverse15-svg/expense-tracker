# Fix: Google Apps Script submission error

## Root cause

The API returns this error (HTTP 200 with error HTML):

```
Illegal spreadsheet id or key: https://docs.google.com/spreadsheets/d/1FIDEr8TIeVhIqYWS_ld8sEqWxll0d4DvlJGSzRCFaVQ/edit?gid=0#gid=0
```

Your Apps Script **Code.gs line 3** uses the **full spreadsheet URL**.  
`SpreadsheetApp.openById()` requires **only the ID**:

```
1FIDEr8TIeVhIqYWS_ld8sEqWxll0d4DvlJGSzRCFaVQ
```

## Fix in Google Apps Script

1. Open [script.google.com](https://script.google.com) → your expense-tracker project.
2. In **Code.gs**, change line 3 from the URL to:

```javascript
const SPREADSHEET_ID = "1FIDEr8TIeVhIqYWS_ld8sEqWxll0d4DvlJGSzRCFaVQ";
const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
```

3. **Deploy → Manage deployments → Edit → New version → Deploy**
4. Web app settings:
   - **Execute as:** Me
   - **Who has access:** Anyone

A full reference script is in [`google-apps-script/Code.gs`](./google-apps-script/Code.gs).

## After fixing

Submit an expense again on the website. The red error should disappear and rows should appear in your Google Sheet.
