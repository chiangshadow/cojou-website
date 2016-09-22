//Backbone.emulateHTTP = true; // Use _method parameter rather than using DELETE and PUT methods
//Backbone.emulateJSON = true; // Send data to server via parameter rather than via request content
define(['jquery', 'backbone', 'model/MainModel', 'model/FooterModel', 'utils/utility'], function($, Backbone, MainModel, FooterModel, Utility) {

    var mainRouter = Backbone.Router.extend({
        routes: {
            "": "linkItems",
            "item/:lang": "linkItems",
            "item/:lang/:type/:page/:fid": "linkItems",
            "item/:lang/:type/:page/:fid/:sid": "linkItems",
            "item/:lang/:type/:page/:fid/:sid/:tid": "linkItems"
        },
        initialize: function(options) {
            this.view = options.view;
            this.view.controller = this;
        },
        main: function() {
            return false;
        },
        linkItems: function(lang, type, page, fid, sid, tid) {
            this.view.ids = [];
            this.view.titles = [];
            this.view.pagetype = null;

            //lang
            if (!!!listLang[lang] && listLang[lang] !== 0) {
                this.navigate("#item/en", {trigger: true});
                return;
            }

            if (typeof type !== "undefined" && type === "0" && (typeof fid !== "undefined" && parseInt(fid) > -2 || typeof sid !== "undefined" && parseInt(sid) > 0)) {
                if (typeof fid !== "undefined" && this.toInt(fid) > -2 && typeof sid === "undefined" && typeof tid === "undefined")
                {
                    this.view.ids.push(this.toStr(fid));
                } else if (typeof fid !== "undefined" && this.toInt(fid) > -2 && typeof sid !== "undefined" && this.toInt(sid) > 0 && typeof tid === "undefined") {
                    this.view.ids.push(this.toStr(fid));
                    this.view.ids.push(this.toStr(sid));
                } else if (typeof fid !== "undefined" && this.toInt(fid) > -2 && typeof sid !== "undefined" && this.toInt(sid) > 0 && typeof tid !== "undefined" && this.toInt(tid) > 0) {
                    this.view.ids.push(this.toStr(fid));
                    this.view.ids.push(this.toStr(sid));
                    this.view.ids.push(this.toStr(tid));
                }
                this.view.selectedItemId = this.view.ids.length > 0 ? this.toInt(this.view.ids[this.view.ids.length - 1]) : 0;
            } else if (typeof type !== "undefined" && type === "1" && typeof fid !== "undefined" && fid > 0 && typeof sid === "undefined" && typeof tid === "undefined") {
                this.view.ids.push(this.toStr(fid));
            }

            if (this.view.isMVCReady && listLang[lang] >= 0 && (this.view.collection.lang !== listLang[lang])) {
                this.view.collection.lang = listLang[lang];
                this.view.footerList.lang = listLang[lang];
                this.getTopContent();
            } else {
                this.view.collection.lang = listLang[lang];
                this.view.footerList.lang = listLang[lang];
            }

            this.view.pagetype = type;
            this.view.currentPageNo = typeof page !== "undefined" && this.toInt(page) > 0 ? page : 1;
            this.view.render();
            return false;
        },
        getTopContent: function() {
            var self = this;
            var mainlist = this.view.collection, maincenterdiv = $("#maincenterdiv");
            if (maincenterdiv.length) {
                maincenterdiv.empty();
                maincenterdiv.addClass("loaderMainCenter");
            }
            $.ajax({
                type: "GET",
                url: "./library/main_meun-" + Utility.enumGetKey(listLang, mainlist.lang) + ".xml",
                dataType: "xml",
                success: function(data) {
                    var FtreeL = null;
                    mainlist.reset();
                    $(data).find('FtreeL').each(function(index) {
                        FtreeL = {
                            "title": self.toStr($(this).attr('title')).toUpperCase(),
                            "id": self.toInt(self.toStr($(this).attr('id'))),
                            "level": self.toInt(self.toStr($(this).attr('level'))),
                            "intro": self.toStr($(this).attr('intro')),
                            "thumbnail": self.toStr($(this).attr('thumbnail')),
                            "twols": self.toInt(self.toStr($(this).attr('twols'))),
                            "flwebprionum": self.toInt(self.toStr($(this).attr('flwebprionum'))),
                            "fileext": self.toStr($(this).attr('fileext')),
                            "StreeLs": [],
                            "albums": []
                        };
                        var StreeLs = [];
                        var StreeL = null;
                        $(this).find('StreeL').each(function(index) {
                            StreeL = {
                                "title": self.toStr($(this).attr('title')).toUpperCase(),
                                "id": self.toInt(self.toStr($(this).attr('id'))),
                                "level": self.toInt(self.toStr($(this).attr('level'))),
                                "intro": self.toStr($(this).attr('intro')),
                                "thumbnail": self.toStr($(this).attr('thumbnail')),
                                "subpriority": self.toInt(self.toStr($(this).attr('subpriority'))),
                                "fileext": self.toStr($(this).attr('fileext')),
                                "albums": [],
                                "items": []
                            };
                            $(this).find('album').each(function(index) {
                                var album = {
                                    "title": self.toStr($(this).attr('title')).toUpperCase(),
                                    "id": self.toInt(self.toStr($(this).attr('id'))),
                                    "level": self.toInt(self.toStr($(this).attr('level'))),
                                    "intro": self.toStr($(this).attr('intro')),
                                    "thumbnail": self.toStr($(this).attr('thumbnail')),
                                    "fileext": self.toStr($(this).attr('fileext')),
                                    "items": []
                                };
                                $(this).find('item').each(function(index) {
                                    var item = {
                                        "itname": self.toStr($(this).attr('itname')).toUpperCase(),
                                        "id": self.toInt(self.toStr($(this).attr('id'))),
                                        "level": self.toInt(self.toStr($(this).attr('level'))),
                                        "thumbnail": self.toStr($(this).attr('thumbnail')),
                                        "imagename": self.toStr($(this).attr('imagename')),
                                        "fileext": self.toStr($(this).attr('fileext')),
                                        "content": self.toStr($(this).text())
                                    };
                                    album["items"].push(item);
                                });
                                StreeL["albums"].push(album);
                            });
                            if (!StreeL.albums.length > 0) {
                                $(this).find('item').each(function(index) {
                                    var item = {
                                        "itname": self.toStr($(this).attr('itname')).toUpperCase(),
                                        "id": self.toInt(self.toStr($(this).attr('id'))),
                                        "level": self.toInt(self.toStr($(this).attr('level'))),
                                        "thumbnail": self.toStr($(this).attr('thumbnail')),
                                        "imagename": self.toStr($(this).attr('imagename')),
                                        "fileext": self.toStr($(this).attr('fileext')),
                                        "content": self.toStr($(this).text())
                                    };
                                    StreeL["items"].push(item);
                                });
                            }
                            StreeLs.push(StreeL);
                        });
                        FtreeL.StreeLs = StreeLs;

                        if (!FtreeL.StreeLs.length > 0) {
                            $(this).find('album').each(function(index) {
                                var album = {
                                    "title": self.toStr($(this).attr('title')).toUpperCase(),
                                    "id": self.toInt(self.toStr($(this).attr('id'))),
                                    "level": self.toInt(self.toStr($(this).attr('level'))),
                                    "intro": self.toStr($(this).attr('intro')),
                                    "thumbnail": self.toStr($(this).attr('thumbnail')),
                                    "fileext": self.toStr($(this).attr('fileext')),
                                    "items": []
                                };
                                $(this).find('item').each(function(index) {
                                    var item = {
                                        "itname": self.toStr($(this).attr('itname')).toUpperCase(),
                                        "id": self.toInt(self.toStr($(this).attr('id'))),
                                        "level": self.toInt(self.toStr($(this).attr('level'))),
                                        "thumbnail": self.toStr($(this).attr('thumbnail')),
                                        "imagename": self.toStr($(this).attr('imagename')),
                                        "fileext": self.toStr($(this).attr('fileext')),
                                        "content": self.toStr($(this).text())
                                    };
                                    album["items"].push(item);
                                });
                                FtreeL["albums"].push(album);
                            });
                        }

                        var item = new MainModel(FtreeL);
                        mainlist.add(item);
                    });

                    //get footer list
                    self.getFooterContent();
                }
            }).done(function(msg) {
//                console.log("Data Header retrieved: " + msg);
            });
            return false;
        },
        getFooterContent: function() {
            var self = this;
            var footerlist = this.view.footerList, maincenterdiv = $("#maincenterdiv");
            $.ajax({
                type: "GET",
                url: "./library/fundaRoot_tree-" + Utility.enumGetKey(listLang, footerlist.lang) + ".xml",
                dataType: "xml",
                success: function(data) {
                    var FLoot = null, SLoot = null, TLoot = null;
                    ;
                    footerlist.reset();
                    if ($(data).find('FLoot').length > 0) {
                        $(data).find('FLoot').each(function(index) {
                            FLoot = {
                                "title": self.toStr($(this).attr('title')).toUpperCase(),
                                "id": self.toInt(self.toStr($(this).attr('id'))),
                                "imagename": self.toStr($(this).attr('imagename')),
                                "priorityset": self.toInt(self.toStr($(this).attr('priorityset'))),
                                "isweblink": self.toInt(self.toStr($(this).attr('isweblink'))),
                                "fileext": self.toStr($(this).attr('fileext')),
                                "content": self.toStr($(this).text())
                            };

                            var item = new FooterModel(FLoot);
                            footerlist.add(item);
                        });
                    }
                    if ($(data).find('SLoot').length > 0) {
                        $(data).find('SLoot').each(function(index) {
                            SLoot = {
                                "title": self.toStr($(this).attr('title')).toUpperCase(),
                                "id": self.toInt(self.toStr($(this).attr('id'))),
                                "imagename": self.toStr($(this).attr('imagename')),
                                "priorityset": self.toInt(self.toStr($(this).attr('priorityset'))),
                                "isweblink": self.toInt(self.toStr($(this).attr('isweblink'))),
                                "fileext": self.toStr($(this).attr('fileext')),
                                "content": self.toStr($(this).text())
                            };

                            var item = new FooterModel(SLoot);
                            footerlist.add(item);
                        });
                    }
                    if ($(data).find('TLoot').length > 0) {
                        $(data).find('TLoot').each(function(index) {
                            TLoot = {
                                "title": self.toStr($(this).attr('title')).toUpperCase(),
                                "id": self.toInt(self.toStr($(this).attr('id'))),
                                "imagename": self.toStr($(this).attr('imagename')),
                                "priorityset": self.toInt(self.toStr($(this).attr('priorityset'))),
                                "isweblink": self.toInt(self.toStr($(this).attr('isweblink'))),
                                "fileext": self.toStr($(this).attr('fileext')),
                                "content": self.toStr($(this).text())
                            };

                            var item = new FooterModel(TLoot);
                            footerlist.add(item);
                        });
                    }
                    if (footerlist.length > 0) {
                        self.view.render();
                    }
                    maincenterdiv.length ? maincenterdiv.removeClass("loaderMainCenter") : null;
                }
            }).done(function(msg) {
//                console.log("Data Footer retrieved: " + msg);
            });
            return false;
        },
        removeBook: function(id) {
            var self = this;
            var mainlist = this.view.collection;
            if (id !== null && id > 0) {
                var theItem = mainlist.get(id);
                theItem.destroy({
                    success: function(mainModel, response) {
                        if (response !== null && response.deleted) {
                            self.view.model.clear().set(self.view.model.defaults);
                            mainlist.remove(mainModel);
                        }
                        self.view.render();
                    }
                });
            }
            return false;
        },
        removeAllBook: function() {
            var mainlist = this.view.collection;
            var self = this;
            $.ajax({
                type: 'DELETE',
                url: mainlist.url,
                success: function(data) {
                    jsonData = JSON.parse(data);
                    if (jsonData !== null && jsonData.deleted) {
                        self.view.model.clear().set(self.view.model.defaults);
                        mainlist.reset();
                        self.view.render();
                    }
                },
                error: function() {
                    self.view.render();
                }
            });
            return false;
        },
        toInt: function(item) {
            try {
                var o = parseInt(item);
                if (!isFinite(o) || isNaN(o))
                    return 0;
                return o;
            } catch (e) {
                return 0;
            }
        },
        toStr: function(item) {
            var newstr = new String(item).trim();
            return (item === null || typeof(item) === "undefined" || !(item.toString())) ? "" : newstr;
        }
    });
    return mainRouter;
});