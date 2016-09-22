define(['jquery', 'backbone', 'utils/utility'], function($, Backbone, Utility) {

    var MainModel = Backbone.Model.extend({
        initialize: function() {
        },
        lang: listLang.en,
        defaults: {
            title: '',
            id: 0,
            level: 0,
            intro: '',
            thumbnail: '',
            twols: 0,
            flwebprionum: 0,
            fileext: '',
            StreeLs: [],
            albums: []
        },
        urlRoot: "./library/main_meun-" + Utility.enumGetKey(listLang, this.lang) + ".xml",
        url: function() {
            var base = this.urlRoot || (this.collection && this.collection.url) || "/";
            if (this.isNew())
                return base;

            return base + "/" + encodeURIComponent(this.id);
        },
        validate: function(attrs) {
            var errors = [];
            return errors.length > 0 ? errors : false;
        }
    });
    return MainModel;
});