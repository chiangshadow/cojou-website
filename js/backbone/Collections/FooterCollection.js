define(['jquery', 'backbone', 'model/FooterModel', 'utils/utility'], function($, Backbone, FooterModel, Utility) {
    var FooterList = Backbone.Collection.extend({
        initialize: function() {
        },
        lang: listLang.en,
        model: FooterModel,
        url: "./library/fundaRoot_tree-" + Utility.enumGetKey(listLang, this.lang) + ".xml"
    });
    return FooterList;
});
