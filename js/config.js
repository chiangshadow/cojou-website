require.config({
    deps: ["js/main"],
    baseUrl: '',
    paths: {
        jquery: './js/jquery-1.11.1.min',
        lodash: './js/lodash.underscore.1.5.2.min',
        backbone: './js/backbone-1.1.0',
        collection: './js/backbone/Collections',
        model: './js/backbone/Models',
        view: './js/backbone/Views',
        router: './js/backbone/Controllers',
        tpl: './js/utils/tpl',
        tpls: './tpls',
        text: './js/text',
        utils: './js/utils'
    },
    shim: {
        backbone: {
            deps: ["lodash", "jquery"],
            exports: "Backbone"
        }
    }
});