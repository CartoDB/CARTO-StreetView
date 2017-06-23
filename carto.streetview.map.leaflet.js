'use strict';
(function () {

    window.cdb = window.cdb || {};
    cdb.streetview = cdb.streetview || {};
    cdb.streetview.mapper = cdb.streetview.mapper || {};

    var sv = cdb.streetview,
        lm = sv.mapper;

    lm.leaflet = function (options, callback) {

        if (options.vector == true) {
            $.getScript('https://mapzen.com/tangram/tangram.min.js')
                .done(function (script, textStatus) {
                    console.log('Tangram loaded');
                    callback();
                })
                .fail(function (jqxhr, settings, exception) {
                    console.error('Failed to load Tangram')
                });
        } else {
            debugger;
            callback();
        }

        var layerdone = false;

        lm.createlayer = function (options) {
            var c = options.coverage;
            if (options.vector == true && window.Tangram) {
                return Tangram.leafletLayer(c);
            } else {
                return L.tileLayer(c.url, c);
            }
        }

        lm.addlayer = function (layer, map, options) {
            if (!layerdone && layer != void 0) {
                layer.addTo(map);
                if (options.vector == true && options.filters != void 0) {
                    var scene = sv._availableLayer.scene;
                    scene.subscribe({
                        load: function (e) {
                            if (layerdone == true) return;
                            layerdone = true;
                            var layers = scene.config.layers;
                            for (var layer in layers) {
                                if (layers.hasOwnProperty(layer)) {
                                    layers[layer].filter = options.filters;
                                }
                            }
                            scene.updateConfig();
                        }
                    });
                }
            } else {
                console.warn('Layer is undefined');
            }
        }

        lm.layervisibility = function (layer, visibility) {
            layer.setOpacity(visibility);
        }

        lm.newicon = function (heading) {
            var
                myimg = "data:image/png;base64,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",
                myhtml = "<div><img src=" + myimg + " style='transform-origin: 50% 50%;transform:rotate(" + heading + "deg);' title='Point of View'><div>",
                icon = new L.divIcon({
                    className: "av-vista",
                    iconSize: L.point(128, 128),
                    html: myhtml
                });
            sv._pov.setIcon(icon);
        };

        lm.pov = function (e, heading) {
            sv._pov = L.marker(e.latlng, {
                contextmenu: true,
                draggable: true
            });
            lm.newicon(0);
            sv._pov.addTo(sv._map);
            sv._pov.on('dragstart', function () {
                if (sv._availableLayer) lm.layervisibility(sv._availableLayer, 1);
            });
            sv._pov.on('dragend', function () {
                sv.provider.callback(sv._pov.getLatLng());
                if (sv._availableLayer) lm.layervisibility(sv._availableLayer, 0);
                if (document.getElementById('av-pano') == void 0) sv.provider.show(e);
            });

        }

        lm.popup = function (e) {
            if (document.getElementById('av-pano') == void 0) {

                var altura = window.getComputedStyle(document.body).height.replace('px', '') * 1 / 3,
                    visorbox = document.createElement('div'),
                    visor = document.createElement('div');

                visorbox.id = 'av-pano-box';
                visorbox.style.cssText = 'min-width:500px;min-height:' + altura + 'px; pointer-events: all !important;';
                visor.id = 'av-pano';
                visor.classList.add('av-pano-viewer');
                visor.style.minHeight= altura + 'px';
                visorbox.appendChild(visor);

                sv._popup = L.popup({
                    minWidth: 500,
                    minHeight: 500,
                    closeOnClick: false
                }).setLatLng(e.latlng);

                sv._popup.on('popupclose remove', function () {
                    sv._pov.remove();
                    sv._map.on('click', sv.provider.show);
                });
                sv._map.off('click', sv.provider.show);

                sv._popup.setContent(visorbox).openOn(sv._map);

            } else {
                if (sv == void 0 || sv._panorama == void 0) {
                    alert('StreetView service not available');
                    return;
                }
            }
        }

        lm.callback = function (p) {
            var latlng = new L.latLng(p.lat(), p.lng());
            sv._pov.setLatLng(latlng);
            sv._popup.setLatLng(latlng);
        };

    }




})();
