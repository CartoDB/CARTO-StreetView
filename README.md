# CARTO-StreetView
#### Proof of concept

Little lib to add contextual street level imagery functionality to CARTO.js application,
adding the needed bidirectional interactio

Test it at: https://cartodb.github.io/CARTO-StreetView/

Functionality so far:
* Map providers
 * [X] Leaflet
 * [ ] Google Maps
 * [ ] CARTO.js
* Imagery providers
 * [X] Google StreetView
 * [X] Mapillary (public images)
 * [ ] Mapillary (private repositories)
* Click anywhere to open an imagery infowindow
* Move within imagery canvas and the PoV marker will move and rotate on the fly to fit the PoV in imagery canvas
* Drag the PoV marker to other location and the imagery availability layer will be displayed while dragging
