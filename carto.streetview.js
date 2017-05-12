'use strict';
/**
*:: CARTO.StreetView - Proof of concept ::
*
*Little lib to contextually add StreetView to CARTO.js visualization
*Based on previous work: av.map.control.streetview.js
*NOTES: This version relies on Leaflet objects not CARTO.js,
* but will be migrated as CARTO.js is released
*
*@author	Abel Vázquez
*@version	1.0.0-pre
*@since	2017-05-12
*/
(function () {

    window.cdb = window.cdb || {};
    cdb.streetview = cdb.streetview || {};

    var
        sv = cdb.streetview,
        availability = {
            "name": "StreetView",
            "tipo": 1,
            "url": "https://mts{s}.google.com/mapslt?lyrs=svv&x={x}&y={y}&z={z}&w=256&h=256&hl=en&style=40,18",
            "att": "StreetView availability, by Google",
            "subdomains": ['', '0', '1', '2', '3'],
            "MaxZoom": 19,
            "trans": true,
            "default": false,
            "opacity": 0
        },
        makeID = function (e) { // from AV-String extension v1.0
            var text = "",
                d,
                r,
                s,
                possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
                p = possible.length;
            for (var i = 0; i < e; i++) {
                d = Date.now();
                s = (window.crypto) ? window.crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000 : Math.random();
                r = (d + s * p) % p | 0;
                text += possible.charAt(r);
            }
            return text;
        };

    sv.new = function (options) {
        var
            init = function (options) {
                var o = {
                    nativeMap: options.nativeMap || window.vis.map,
                    range: options.range || 50
                };
                sv.range = o.range;
                sv._map = o.nativeMap;
                sv.availableLayer.addTo(sv._map);
                o.nativeMap.on('click', cdb.streetview.show);
            },
            Gcallback = makeID(6);

        window[Gcallback] = function () {
            init(options);
            delete window[Gcallback];
        };

        sv.availableLayer = L.tileLayer(availability.url, availability);

        $.getScript('https://maps.google.com/maps/api/js?v=3&sensor=false&callback=' + Gcallback)
            .done(function (script, textStatus) {
                console.log('Google API loaded');
            })
            .fail(function (jqxhr, settings, exception) {
                console.error('Failed to load Google API')
            });

    };

    sv.show = function (e) {

        var punto = new google.maps.LatLng(e.latlng.lat, e.latlng.lng),
            servicio = new google.maps.StreetViewService(),
            accion = function (data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var newicon = function (heading) {
                            var myimg = "data:image/png;base64,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",
                                myhtml = "<div><img src=" + myimg + " style='transform-origin: 50% 50%;transform:rotate(" + heading + "deg);' title='Point of View'><div>";
                            return new L.divIcon({
                                className: "av-vista",
                                iconSize: L.point(128, 128),
                                html: myhtml
                            });
                        },
                        peeper = L.marker(e.latlng, {
                            icon: newicon(0),
                            contextmenu: true,
                            draggable: true
                        }),
                        popup = L.popup({
                            minWidth: 500,
                            minHeight: 500,
                            closeOnClick: false
                        }).setLatLng(e.latlng);

                    if (sv._peeper && sv._map.hasLayer(sv._peeper)) sv._peeper.remove();

                    sv._peeper = peeper;

                    if (document.getElementById('av-pano') == void 0) {
                        var altura = window.getComputedStyle(document.body).height.replace('px', '') * 1 / 3,
                            panoramaOptions = {
                                position: punto,
                                pov: {
                                    heading: 0,
                                    pitch: 10
                                }
                            },
                            visorbox = document.createElement('div'),
                            visor = document.createElement('div');
                        visorbox.id = 'av-pano-box';
                        visorbox.style.cssText = 'min-width:500px;min-height:' + altura + 'px; pointer-events: all !important;';
                        visor.id = 'av-pano';
                        visor.style.cssText = 'width:100%; height: 100%; min-width:500px;min-height:' + altura + 'px; pointer-events: all !important;';
                        visorbox.appendChild(visor);
                        popup.setContent(visorbox).openOn(sv._map);
                        popup.on('popupclose remove', function () {
                            sv._peeper.remove();
                            sv._map.on('click', cdb.streetview.show);
                        });
                        sv._map.off('click', cdb.streetview.show);
                        sv.panorama = new google.maps.StreetViewPanorama(document.getElementById('av-pano'), panoramaOptions);
                        google.maps.event.trigger(document.getElementById('av-pano'), 'resize');
                        google.maps.event.addListener(sv.panorama, 'position_changed', function () {
                            var p = sv.panorama.getPosition(),
                                latlng = new L.latLng(p.lat(), p.lng());
                            peeper.setLatLng(latlng);
                            popup.setLatLng(latlng);
                        });
                        google.maps.event.addListener(sv.panorama, 'pov_changed', function () {
                            peeper.setIcon(newicon(sv.panorama.getPov().heading));
                        });
                        peeper.addTo(sv._map);
                        peeper.on('dragstart', function () {
                            sv.availableLayer.setOpacity(1);
                        });
                        peeper.on('dragend', function () {
                            var lp = peeper.getLatLng(),
                                gp = new google.maps.LatLng(lp.lat, lp.lng);
                            servicio.getPanoramaByLocation(gp, sv.range, function (streetViewPanoramaData, status) {
                                if (status === google.maps.StreetViewStatus.OK) {
                                    sv.panorama.setPosition(gp);
                                } else {
                                    var p = sv.panorama.getPosition(),
                                        latlng = new L.latLng(p.lat(), p.lng());
                                    peeper.setLatLng(latlng);
                                    popup.setLatLng(latlng);
                                }
                            });
                            sv.availableLayer.setOpacity(0);
                            if (document.getElementById('av-pano') == void 0) cdb.streetview.show(e);
                        });
                    } else {
                        if (sv == void 0 || sv.panorama == void 0) {
                            alert('StreetView service not available');
                            return;
                        }
                        sv.panorama.setPosition(punto);
                        peeper.setLatLng(e.latlng);
                        popup.setLatLng(e.latlng);
                    }
                } else {
                    console.warn('No Google StreetView data in the selected location');
                }
            };
        servicio.getPanoramaByLocation(punto, sv.range, accion);
    }
})();
