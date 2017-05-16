'use strict';
(function () {

    window.cdb = window.cdb || {};
    cdb.streetview = cdb.streetview || {};
    cdb.streetview.provider = cdb.streetview.provider || {};

    var sv = cdb.streetview,
        gp = sv.provider,
        m = sv.mapper,
        availability = {
            "url": "https://mts{s}.google.com/mapslt?lyrs=svv&x={x}&y={y}&z={z}&w=256&h=256&hl=en&style=40,18",
            "attribution": "StreetView availability, by Google",
            "subdomains": ['', '0', '1', '2', '3'],
            "MaxZoom": 19,
            "opacity": 0
        };

    gp.google = function (options) {

        var
            service,
            init = function (options) {
                sv._range = options.range || 50;
                sv.mapper.addlayer(sv._availableLayer, sv._map);
                service = new google.maps.StreetViewService();
                options.nativeMap.on('click', gp.show);
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
            },
            Gcallback = makeID(6),
            url = 'https://maps.googleapis.com/maps/api/js?sensor=false' + ((options.API_KEY) ? '&key=' + options.API_KEY : '') + '&callback=' + Gcallback;

        window[Gcallback] = function () {
            init(options);
            delete window[Gcallback];
        };

        sv._availableLayer = sv.mapper.createlayer(availability);

        $.getScript(url)
            .done(function (script, textStatus) {
                console.log('Google API loaded');
            })
            .fail(function (jqxhr, settings, exception) {
                console.error('Failed to load Google API')
            });


        gp.show = function (e) {
            var
                point = new google.maps.LatLng(e.latlng.lat, e.latlng.lng),
                panoramaOptions = {
                    position: point,
                    pov: {
                        heading: 0,
                        pitch: 10
                    }
                },
                action = function (data, status) {
                    if (status == google.maps.StreetViewStatus.OK) {
                        sv.mapper.pov(e, 0);
                        sv.mapper.popup(e);
                        sv._panorama = new google.maps.StreetViewPanorama(document.getElementById('av-pano'), panoramaOptions);
                        google.maps.event.trigger(document.getElementById('av-pano'), 'resize');
                        google.maps.event.addListener(sv._panorama, 'position_changed', function () {
                            sv.mapper.callback(sv._panorama.getPosition());
                        });
                        google.maps.event.addListener(sv._panorama, 'pov_changed', function () {
                            sv.mapper.newicon(sv._panorama.getPov().heading);
                        });
                    } else {
                        console.warn('No Google StreetView data in the selected location within ' + sv._range + ' m');
                    }
                };
            service.getPanoramaByLocation(point, sv.range, action);
        }

        gp.callback = function (p) {
            var gpoint = new google.maps.LatLng(p.lat, p.lng);
            service.getPanoramaByLocation(gpoint, sv._range, function (streetViewPanoramaData, status) {
                if (status === google.maps.StreetViewStatus.OK) {
                    sv._panorama.setPosition(gpoint);
                } else {
                    sv.mapper.callback(sv.panorama.getPosition());
                }
            });
        }

    }



})();
