# Fix Drive upload (required — read this)

Your sheet still shows **base64 in Bill Link** because the **old Apps Script** is still deployed on Google.  
The website on Cloudflare is updated automatically; **Apps Script is NOT**.

## Do this now (5 minutes)

1. Open https://script.google.com → your WICASA expense project  
2. Select **Code.gs** → delete everything  
3. Copy **all** of `google-apps-script/Code.gs` from GitHub and paste  
4. **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**  
5. Confirm:
   - **Execute as:** Me  
   - **Who has access:** Anyone  

## Share Drive folders

The Google account that runs the script must be **Editor** on every member folder in `MEMBER_FOLDERS` (including Sumit: `194z_DyDj11qZzjO6LmhqUUX_apCOfh7Z`).

## After deploy — test

| Step | Expected |
|------|----------|
| Submit as **Sumit Gupta** + receipt | File appears in Sumit's Drive folder |
| Google Sheet column C | **View Receipt** link (not `iVBORw0...` base64) |
| Column F | Description text |

## Sheet columns (unchanged)

| A Name | B Amount | C Bill Link | D Status | E Date | F Description |
