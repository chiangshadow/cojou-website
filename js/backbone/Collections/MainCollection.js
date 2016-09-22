define(['jquery', 'backbone', 'model/MainModel', 'utils/utility'], function($, Backbone, MainModel, Utility) {
    var Mainlist = Backbone.Collection.extend({
        initialize: function() {
        },
        lang: listLang.en,
        model: MainModel,
        url: "./library/main_meun-" + Utility.enumGetKey(listLang, this.lang) + ".xml"
    });
    return Mainlist;
});
