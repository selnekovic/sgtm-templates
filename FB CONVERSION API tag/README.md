# Facebook Conversion API tag with BigQuery Extension

A server-side tag template for Facebook Conversion API. Designed to process GA4 data from a website.

**Version:** 1.2.0

## How to use

1. Create a dataset and table in Google Cloud Platform (GCP) where you have deployed Cloud Run or App Engine server for server-side Google Tag Manager (GTM). You can use the table schema provided in this repository.
2. Import the tag template to the server-side Google Tag Manager. In the template editor, add your BigQuery project name, dataset, and table to permissions.
3. Create a tag and insert your BigQuery project name, dataset, and table.

## Changelog

### 1.2.0

- Anonymising IP addresses when consent is denied.
- Disabling storing any cookies when consent is denied.

### 1.1.0

- User data are sent only when ad consent is given.
- Opt-out flag is always included based on the given consent.
- `fbp` cookies are set to the browser only when consent is given.
- Checkbox for IP address sharing.

### 1.0.3

- Update API version to v22.

### 1.0.2

- Corrected BigQuery parameter name `referrer`.
- Fixed `fb_object` on/off condition.
- Fixed `_fbc` cookie logic.

### 1.0.1

- Fixed `fb_object` logic.

### 1.0.0

- Initial version.
