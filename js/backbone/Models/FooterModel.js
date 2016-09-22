define(['jquery', 'backbone', 'utils/utility'], function($, Backbone, Utility) {

    var FooterModel = Backbone.Model.extend({
        initialize: function() {
        },
        lang: listLang.en,
        defaults: {
            title: '',
            id: 0,
            imagename: '',
            priorityset: 0,
            isweblink: 0,
            fileext: '',
            content: ''
        },
        urlRoot: "./library/fundaRoot_tree-" + Utility.enumGetKey(listLang, this.lang) + ".xml",
        url: function() {
            var base = this.urlRoot || (this.collection && this.collection.url) || "/";
            if (this.isNew())
                return base;

            return base + "/" + encodeURIComponent(this.id);
        },
        validate: function(attrs) {
            var errors = [];
//            if (!attrs.title.trim()) {
//                errors.push({name: "title", message: "Please fill title field"});
//            }
//            if (!attrs.author.trim()) {
//                errors.push({name: "author", message: "Please fill author field"});
//            }
//            if (!attrs.location.trim()) {
//                errors.push({name: "location", message: "Please fill location field"});
//            }
            return errors.length > 0 ? errors : false;
        }
    });
    return FooterModel;
});