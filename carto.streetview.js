'use strict';
/**
 *:: CARTO.StreetView - Proof of concept ::
 *
 *Little lib to contextually add street level imagery to CARTO.js visualization
 *Based on previous work: av.map.control.streetview.js
 *
 *@author	Abel Vázquez
 *@version	1.0.0-pre
 *@since	2017-05-12
 */
(function () {

    window.cdb = window.cdb || {};
    cdb.streetview = cdb.streetview || {};

    var sv = cdb.streetview;

    sv.new = function (options) {
        var
            p = (options.provider && options.provider.length > 0) ? options.provider.toLowerCase() : 'google',
            m = (options.mapper && options.mapper.length > 0) ? options.mapper.toLowerCase() : 'leaflet',
            loadprovider = function () {
                $.getScript('carto.streetview.provider.' + p + '.js')
                    .done(function (script, textStatus) {
                        sv.provider[p](options);
                    });
            };

        sv._map = options.nativeMap;

        $.getScript('carto.streetview.map.' + m + '.js')
            .done(function (script, textStatus) {
                sv.mapper[m](options, loadprovider);
            });

    };

})();
