## Sample body for GA4 event with items parameter

{
  "client_id": "123456789",  
  "event": "custom_conversion",
  "ecommerce": {
    "item_list_id": "related_products",
    "item_list_name": "Related products",
    "items": [
    {
      "item_id": "SKU_12345",
      "item_name": "Stan and Friends Tee",
      "price": 10.01,
      "quantity": 3
    }
    ]
  }
}

