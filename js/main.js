require(['jquery', 'backbone', 'model/MainModel', 'collection/MainCollection', 'model/FooterModel', 'collection/FooterCollection', 'view/MainView', 'router/MainRouter', 'tpl'],
        function($, Backbone, MainModel, Mainlist, FooterModel, FooterList, MainView, MainRouter, tpl) {
            $(function() {
                init_myrouter();
            });
            function pageload() {
                init_myrouter();
            }
            var _router = null, _view = null;
            function init_myrouter() {
                if (typeof String.prototype.trim !== 'function') {
                    String.prototype.trim = function() {
                        return this.replace(/^\s+|\s+$/g, '');
                    };
                }
                if (!_router && MainRouter) {
                    //set templates
                    _view = new MainView({model: new MainModel, collection: new Mainlist, footerModel: new FooterModel, footerList: new FooterList});
                    _router = new MainRouter({view: _view});
                    Backbone.history.start();
                }
            }
        });

