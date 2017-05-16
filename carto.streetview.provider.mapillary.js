'use strict';
(function () {

    window.cdb = window.cdb || {};
    cdb.streetview = cdb.streetview || {};
    cdb.streetview.provider = cdb.streetview.provider || {};

    var sv = cdb.streetview,
        mp = sv.provider,
        m = sv.mapper,
        availability = {
            url: 'https://d6a1v2w10ny40.cloudfront.net/v0.1/{z}/{x}/{y}.png',
            opacity: 0,
            attribution:  "Imagery availability, by Mapillary"
        };

    mp.mapillary = function (options) {

        var
            init = function (options) {
                sv.mapper.addlayer(sv._availableLayer, sv._map);
                options.nativeMap.on('click', mp.show);
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
            Mcallback = makeID(6),
            url = 'https://unpkg.com/mapillary-js@2.5.0/dist/mapillary.min.js';


        var link = document.createElement('link')
        link.setAttribute('rel', 'stylesheet')
        link.setAttribute('type', 'text/css')
        link.setAttribute('href', 'https://unpkg.com/mapillary-js@2.5.0/dist/mapillary.min.css')
        document.getElementsByTagName('head')[0].appendChild(link);

        window[Mcallback] = function () {
            init(options);
            delete window[Mcallback];
        };

        sv._availableLayer = sv.mapper.createlayer(availability);

        $.getScript(url)
            .done(function (script, textStatus) {
                console.log('Mapillary library loaded');
                window[Mcallback]();
            })
            .fail(function (jqxhr, settings, exception) {
                console.error('Failed to load Mapillary library');
            });


        mp.show = function (e) {
            var
                lat = e.latlng.lat,
                lng = e.latlng.lng,
                panoramaOptions = {
                    component: {
                        cover: false
                    }
                };

            sv.mapper.pov(e, 0);
            sv.mapper.popup(e);

            sv._panorama = new Mapillary.Viewer(
                'av-pano',
                options.CLIENT_ID,
                null,
                panoramaOptions
            );

            sv._panorama.on(
                Mapillary.Viewer.bearingchanged,
                function (bearing) {
                    sv.mapper.newicon(bearing);
                });

            sv._panorama.on(
                Mapillary.Viewer.nodechanged,
                function (node) {
                    var p = {
                        lat: function () {
                            return node.latLon.lat;
                        },
                        lng: function () {
                            return node.latLon.lon;
                        }
                    };
                    sv.mapper.callback(p);
                });

            sv._panorama.moveCloseTo(lat, lng)
                .then(
                    function (node) {
                        //console.log(node.key);
                        $('.domRenderer > div').css({'z-index':'100'});
                    },
                    function (error) {
                        console.error(error);
                    });

        }

        mp.callback = function (p) {
            sv._panorama.moveCloseTo(p.lat, p.lng)
                .then(
                    function (node) {
                       // console.log(node.key);
                    },
                    function (error) {
                        console.error(error);
                    });

        }

    }



})();
