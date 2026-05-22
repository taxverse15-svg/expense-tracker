# Google Apps Script — Drive upload setup

## What the backend does now

1. Receives name, amount, description, receipt image (base64)
2. Looks up the member's Drive folder from `MEMBER_FOLDERS`
3. Uploads the receipt file into that folder
4. Saves a **clickable Drive link** in the sheet (not base64)
5. Saves description, amount, name, timestamp, file name, status

## You must update Apps Script manually

Cloudflare deploys the **website only**. The script runs in **Google Apps Script**.

1. Open [script.google.com](https://script.google.com) → your expense project
2. Replace all of `Code.gs` with the contents of [`google-apps-script/Code.gs`](./google-apps-script/Code.gs)
3. **Deploy → Manage deployments → Edit → New version → Deploy**
4. Settings: **Execute as: Me**, **Who has access: Anyone**

## Sheet columns

| Timestamp | Name | Amount | Description | Receipt File | Drive Link | Status |

## Drive permissions

The Google account that owns the script must have **edit access** to every member folder in `MEMBER_FOLDERS`.

## Test

1. Submit expense for **Hardik Kothari** with a receipt image
2. Check Hardik's Drive folder for the new file
3. Check the sheet — **Drive Link** column should show "View Receipt" (not long base64 text)
