# stock market app
 
This app is used to retrieve data related to the stock market.

HELP

For NASDAQ100 data retrieval 

-Enter "l" in the keyword text input then press "NASDAQ100 stock retriever" button to list all companies on the NASDAQ100 <br />
-Enter a company name in the keyword text input then press "NASDAQ100 stock retriever" to search for stock market data  <br />

Bloomberg radio

-Press the "Bloomberg radio button" <br />
-There will be a screen with two buttons: "Resume" and "Stop" <br />
-It should be noted that there is some text below these buttons and once the bloomberg stream url has been determined then play resume <br />
-Sometimes the "resume" button has to be pressed more than once and this will be debugged in future devlopment of the app <br />
-To stop the radio stream press the "stop" button <br />

Show HQ locations of SP500 companies on a map

-press the "Maps" button <br />
-for this to function properly you will need to obtain a google maps API key yourself,  <br />
follow this link for information regarding this: https://developers.google.com/maps/documentation/android-sdk/overview <br />
-once you have the api key add this to the AndroidManifest.xml file  <br />
-when the app is first launched there will be two options once the "Maps" button is pressed <br />
-the first button will retrieve the HQ locations of SP500 companies and plot them on a map <br />
-the second button will load from local storage and this assumes that the first button has been pressed previously and all data has been retrieved successfully  <br />
-the second button will also load place names into a dropdown menu which can be used to zoom in on a particular state <br />

Final note

This app is currently in development. <br />
