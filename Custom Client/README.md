# sGTM Custom Client For Debugging 

Useful helper for debugging server-side GTM. You can send GA4 like ecommerce requests with items parameter or requests with custom body to debug marketing tags.

The default path is "/custom-client", but you can also define your own directly in the tag.

### Notice
Every key in request body has to be in quotes! 

Don't forget to use Preview header when you are debugging. Don't use the client in production environment.  


## Examples of body request in Postman:

### GA4 event

<img width="846" alt="ga4_event" src="https://github.com/Dase-Analytics/gtm-templates/assets/92515279/0a775332-1cfb-4ccb-b722-85b7521894cb">


### Custom event

<img width="844" alt="custom_event" src="https://github.com/Dase-Analytics/gtm-templates/assets/92515279/4f3cbb61-aae9-4202-9591-bfe2d02cf7ed">