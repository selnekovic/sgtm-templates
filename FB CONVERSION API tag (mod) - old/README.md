# Conversion API Tag with BigQuery Extension

This modified tag is based on the Facebook Incubator Conversion API tag, allowing data to be sent to BigQuery as well.

### How to Use:

1. Create a dataset and table in Google Cloud Platform (GCP) where you have deployed Cloud Run or App Engine server for server-side Google Tag Manager (GTM). You can use the table schema provided in this repository.

2. Import the tag template to the server-side Google Tag Manager. In the template editor, add your BigQuery project name, dataset, and table to permissions.

3. Create a tag and insert your BigQuery project name, dataset, and table.


