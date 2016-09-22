define(['jquery', 'lodash', 'backbone', 'text!tpls/main.html', 'text!tpls/headMain.html', 'text!tpls/header.html', 'text!tpls/footMain.html', 'text!tpls/footer.html', 'utils/utility'], function($, _, Backbone, tplMain, tplHeadMain, tplHeader, tplFootMain, tplFooter, Utility) {

    var MainView = Backbone.View.extend({
        t_main: _.template(tplMain),
        t_headMain: _.template(tplHeadMain),
        t_header: _.template(tplHeader),
        t_footMain: _.template(tplFootMain),
        t_footer: _.template(tplFooter),
        el: "body",
        initialize: function(options) {
            _.bindAll(this, "mainImgClick", "resize", "modelChanged", "langSelect_Change");
            _.defer(_.bind(this.MVCReady, this));
            this.collection = options.collection;
            this.footerList = options.footerList;
            this.mainCenterPage = $("#maincenterdiv");
            this.lastSelectedThis = null;
            this.selectedItemId = 0;
            this.ids = [];
            this.titles = [];
            this.currentPageNo = 1;
            this.currentObjwrap = null;
            this.itemsOfPages = [];
            this.wraptype = null;
            this.itemImgIndex = 0;
            this.pagetype = null;
            this.priHeaderdivOffsetWidth = 0;
            this.headerItemInfo = {currentPage: 1, pagesItems: []};
            this.isMVCReady = false;

            var self = this;
            //this.resize();
            $(window).resize(this.resize);
            this.model.on("change", this.modelChanged);
            $("#logo-wrapper > img:eq(0)").click(function() {
                window.location.href = location.pathname + "#item/" + Utility.enumGetKey(listLang, self.collection.lang);
            });
            $("#maincenterdiv").delegate("#div-mainslideshow img", "click", this.mainImgClick);

            $("#cojouLangSelect").change(this.langSelect_Change);
        },
        MVCReady: function() {
            this.controller.getTopContent();
            this.isMVCReady = true;
        },
        render: function() {
            var dataList = {headerlist: this.collection.toJSON(), selectedItem: null, footselectItem: null}, self = this;
            var fl = {footerlist: this.footerList.toJSON(), selectedItem: null}, getHeaderModel = null, getFooterModel = null, getCurrentModel = null, getCurrentModels = [];
            var mainSSTag = null, numItem = 0, setSSNumItem = 5, _title = null;
            self.itemImgIndex = 0;

            var _lang = Utility.enumGetKey(listLang, this.collection.lang);
            $("#cojouLangSelect").val(_lang);

            if (this.selectedItemId !== 0 && dataList.headerlist.length > 0 && this.pagetype !== null && this.pagetype === '0') {
                this.mainCenterPage.html(this.t_headMain());
                if (self.ids !== null && self.ids.length > 0) {
                    $.each(self.ids, function(n, id) {
                        switch (n) {
                            case 0:
                                getHeaderModel = self.collection.get({"id": id});
                                getCurrentModel = typeof getHeaderModel !== "undefined" ? getHeaderModel.toJSON() : null;
                                if (getCurrentModel === null) {
                                    return false;
                                }
                                _title = getCurrentModel.title;
                                break;
                            case 1:
                                getCurrentModels = (getCurrentModel !== null && getCurrentModel.StreeLs.length > 0) ? getCurrentModel.StreeLs : (getCurrentModel !== null && getCurrentModel.albums.length > 0) ? getCurrentModel.albums : null;
                                if (typeof getCurrentModels === "undefined") {
                                    return false;
                                }
                                getCurrentModel = $.grep(getCurrentModels, function(m) {
                                    return m.id === self.toInt(id) ? m : null;
                                })[0];
                                _title = getCurrentModel.title;
                                break;
                            case 2:
                                getCurrentModels = (getCurrentModel !== null && !!getCurrentModel.albums && getCurrentModel.albums.length > 0) ? getCurrentModel.albums : (getCurrentModel !== null && getCurrentModel.items.length > 0) ? getCurrentModel.items : null;
                                if (typeof getCurrentModels === "undefined") {
                                    return false;
                                }
                                getCurrentModel = $.grep(getCurrentModels, function(m) {
                                    return m.id === self.toInt(id) ? m : null;
                                })[0];
                                _title = getCurrentModel.itname;
                                break;
                        }
                        self.titles[n] = {"level": self.toInt(getCurrentModel.level), "title": self.toStr(_title), "datainfo": getCurrentModel};
                    });
                }
                if (getCurrentModel !== null) {
                    this.disableEvent();
                    this.model.clear().set(getCurrentModel);
                }
                dataList.selectedItem = getHeaderModel !== null ? getHeaderModel : null;
            } else if (fl.footerlist.length > 0 && this.pagetype !== null && this.pagetype === "1") {
                this.mainCenterPage.html(this.t_footMain());
                this.model.clear();
                if (self.ids !== null && self.ids.length > 0) {
                    getFooterModel = self.footerList.get({"id": self.ids[0]});
                    this.model.set(getFooterModel.toJSON());
                }
                fl.selectedItem = getFooterModel !== null ? getFooterModel : null;
                dataList.footselectItem = fl.selectedItem;
            } else if (dataList.headerlist.length > 0 && typeof this.pagetype === "undefined") {
                this.mainCenterPage.html(this.t_main());
                this.model.clear();

                mainSSTag = $("#div-mainslideshow");
                numItem = this.collection.models.length <= setSSNumItem ? this.collection.models.length : setSSNumItem;
                for (var i = 0; i < numItem; i++) {
                    this.addimgslideshow(mainSSTag, "./images/fwctgy/", "./images/fwctgy/big_image/", this.collection.models[i].get("thumbnail") + this.collection.models[i].get("fileext"), ".fix-slide-w-dimension fix-slide-h-dimension", this.collection.models[i].get("id"));
                }
                var _imgtag = null;
                for (var i = 0; i < numItem; i++) {
                    _imgtag = mainSSTag.children("div:eq(" + i + ")").children("img:eq(0)");
                    this.loadImage(_imgtag, "./images/fwctgy/big_image/", this.collection.models[i].get("thumbnail") + this.collection.models[i].get("fileext"));
                }
                mainSSTag.children(":eq(0)").show();
                this.slideshow(mainSSTag, 3000, numItem);
            }

            if (dataList !== null && dataList.headerlist.length > 0) {
                if (fl.footerlist.length >= 2) {
                    dataList.secheader = fl.footerlist[1];
                }
                $("#topcontentdiv").html(this.t_header(dataList));
                if ($("#priHeaderdiv").length > 0) {
                    this.priHeaderdivOffsetWidth = $("#priHeaderdiv").get(0).offsetWidth;
                }
                self.renderHeaderPages();
            }
            if (fl !== null && fl.footerlist.length > 0) {
                $("#bottomcontentdiv").html(this.t_footer(fl));
            }
        },
        get_itemsOfPages: function(itemswrap, items, type) {
            var self = this, objtype = '', imagepath = '', thumbnailpath = '', inneritemswraps = [], inneritemswrap = $("<dv class='inneritemswrap'></div>");
            var imgwidth = 0, imgheight = 0, itemswrap_width = itemswrap.parent("div.itemdisplaysection").width(), itemswrap_height = itemswrap.parent("div.itemdisplaysection").height();
            var item_margin = 0, offset = 0, numOfRowPerPage = 0, inneritemswrapsPerPage = [], _itemsOfPages = [], _itemTitle = '';
            switch (type.toLowerCase()) {
                case "album":
                    objtype = "albumdiv";
                    thumbnailpath = "./images/album/";
                    imagepath = "./images/album/album_image/";
                    imgwidth = 201;
                    imgheight = 113;
                    item_margin = 0.01;
                    break;
                case "thumbnail":
                    objtype = "thumbnaildiv";
                    thumbnailpath = "./images/gallery/thumbnail/";
                    imagepath = "./images/gallery/flashwthumbnail/";
                    imgwidth = 160;
                    imgheight = 90;
                    item_margin = 0.06;
                    break;
            }

            //offset
            offset = itemswrap_width / (imgwidth + (itemswrap_width * item_margin));
            if (offset % 1 < 0.05 || offset % 1 > 0.05 && offset % 1 < 0.5) {
                offset = Math.round(offset);
            } else if (offset % 1 > 0.05 && offset % 1 > 0.5) {
                offset = Math.round(offset) - 1;
            }

            //number Of Row Per Page
            numOfRowPerPage = itemswrap_height / (imgheight + (itemswrap_height * item_margin));
            if (numOfRowPerPage % 1 < 0.05 || numOfRowPerPage % 1 > 0.05 && numOfRowPerPage % 1 < 0.5) {
                numOfRowPerPage = Math.round(numOfRowPerPage);
            } else if (numOfRowPerPage % 1 > 0.05) {
                numOfRowPerPage = Math.round(numOfRowPerPage) - 1;
            }

            if (items !== null, items.length > 0 && objtype !== '' && offset !== 0 && numOfRowPerPage !== 0) {
                $.each(items, function(n, item) {
                    _itemTitle = typeof item.title !== "undefined" ? item.title : (typeof item.itname !== "undefined" ? item.itname : '');
                    inneritemswrap.append("<div class='" + objtype + "' ><img class='row-comd menubaritem' disabled='disabled' src='" + (thumbnailpath + item.thumbnail + item.fileext) + "'  title='" + self.toStr(_itemTitle) + "' alt='" + self.toStr(_itemTitle) + "'></div>");
                    inneritemswrap.children("." + objtype).last("." + objtype).children("img.menubaritem:eq(0)").attr("data-index", n).data("data-info", item);
                    if (((n + 1) % offset === 0 && (n + 1) !== 1) || (offset === 1)) {
                        inneritemswraps.push(inneritemswrap);
                        inneritemswrap = '';
                        inneritemswrap = $("<dv class='inneritemswrap'></div>");
                    } else if ((n + 1) % offset !== 0 && (n + 1) === items.length) {
                        inneritemswraps.push(inneritemswrap);
                    }
                });
                $.each(inneritemswraps, function(n, o) {
                    $.map($(o).children(), function(item, n) {
                        var _imgitem = $(item).children("img.menubaritem");
                        self.loadImage(_imgitem, imagepath, (_imgitem.data("data-info").thumbnail + _imgitem.data("data-info").fileext));
                    });
                });
                //make pages
                if (inneritemswraps !== null && inneritemswraps.length > 0) {
                    $.each(inneritemswraps, function(n, i) {
                        inneritemswrapsPerPage.push(i);
                        if (((n + 1) % numOfRowPerPage === 0 && (n + 1) !== 1) || (numOfRowPerPage === 1)) {
                            _itemsOfPages.push(inneritemswrapsPerPage);
                            inneritemswrapsPerPage = [];
                        } else if ((n + 1) % numOfRowPerPage !== 0 && (n + 1) === inneritemswraps.length) {
                            _itemsOfPages.push(inneritemswrapsPerPage);
                        }
                    });
                }

                if (self.itemImgIndex > 0) {
                    for (var i = 1; i < (i + 1); i++) {
                        if ((offset * numOfRowPerPage) * i > (self.itemImgIndex)) {
                            self.currentPageNo = self.toInt(i);
                            break;
                        }
                    }
                }
            }

            if (self.currentPageNo > _itemsOfPages.length) {
                self.currentPageNo = 1;
            }
            self.controller.navigate(self.createActionLink({"lang": Utility.enumGetKey(listLang, self.collection.lang), "type": "0", "page": self.currentPageNo, "ids": self.ids}), {trigger: false});

            return _itemsOfPages;
        },
        renderCurrentItemsPage: function(itemswrap, itemsOfPages) {
            var self = this, leftNavThumbnailImg = null, rightNavThumbnailImg = null;
            if (itemsOfPages !== null && itemsOfPages.length > 0 && self.currentPageNo > 0 && itemsOfPages[(self.currentPageNo - 1)] !== null) {
                itemswrap.html(itemsOfPages[(self.currentPageNo - 1)]);

                if ((leftNavThumbnailImg = $("#leftNavThumbnailImg")).length > 0 && (rightNavThumbnailImg = $("#rightNavThumbnailImg")).length > 0) {
                    if (self.currentPageNo < itemsOfPages.length && itemsOfPages.length > 1) {
                        if (self.toInt(self.currentPageNo) === 1) {
                            leftNavThumbnailImg.hide();
                        } else {
                            leftNavThumbnailImg.show();
                        }
                        rightNavThumbnailImg.show();
                    } else if (self.toInt(self.currentPageNo) === itemsOfPages.length && itemsOfPages.length > 1) {
                        leftNavThumbnailImg.show();
                        rightNavThumbnailImg.hide();
                    } else if (itemsOfPages.length === 1) {
                        leftNavThumbnailImg.hide();
                        rightNavThumbnailImg.hide();
                    }
                }
            }
            return false;
        },
        renderCurrentItemDetail: function(itemDetailWrap, selectedItem, items) {
            var self = this, imagepath = "./images/gallery/", thumbnailpath = "./images/gallery/thumbnail/";
            if (itemDetailWrap !== null && itemDetailWrap.length > 0 && selectedItem !== null && items !== null && items.length > 0) {
                itemDetailWrap.children("div.itemimage").html("<img class='itemimage row-comd' disabled='disabled' src='" + (thumbnailpath + selectedItem.thumbnail + selectedItem.fileext) + "'  title='" + self.toStr(selectedItem.itname) + "' alt='" + self.toStr(selectedItem.itname) + "'>");
                self.loadImage(itemDetailWrap.children("div.itemimage").children("img:eq(0)"), imagepath, (selectedItem.imagename + selectedItem.fileext));
                itemDetailWrap.children("div.itemcontent").html("<span>" + selectedItem.content + "</span>");
                itemDetailWrap.children("div.itemimage").children("img:eq(0)").data("data-info", selectedItem);

                self.itemImgIndex = self.toInt($(".imgselected").parent().index());
            }
            return false;
        },
        events: {
            'mouseover .row-comd': 'com_cmd',
            'mouseout .row-comd': 'com_cmd',
            'click .row-comd': 'com_cmd'
        },
        com_cmd: function(e) {
            var self = this, $this = $(e.target), _item = null, _title = null;
            var eventType = e.type.toLowerCase(), menubody = $(".menubarbody"), selectedmenuitem = null, itemswrap = null;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            switch (eventType) {
                case "mouseover":
                    if ($this.hasClass("headerItem") || $this.hasClass("footerItem") || $this.hasClass("menubaritem")) {
                        $this.addClass("mousehover");

                        if ($this.prop("tagName").toLowerCase() === "img" && $this.attr("data-index") !== "undefined") {
                            $this.parent().addClass("mousehoverthumbnail");
                            selectedmenuitem = menubody.children("div.menubaritemwrap:eq(" + $this.attr("data-index") + ")").children("span.menubaritem:eq(0)").addClass("mousehover");
                        } else if ($this.prop("tagName").toLowerCase() === "span" && $this.hasClass("menubaritem")) {
                            itemswrap = $(".thumbnailwrap").length > 0 ? $(".thumbnailwrap") : $(".albumwrap");
                            itemswrap.find("img.menubaritem").each(function(i, o) {
                                if ($(o).attr("data-index") === self.toStr($this.parent().index())) {
                                    $(o).parent().addClass("mousehoverthumbnail");
                                    return false;
                                }
                            });
                        }
                    }
                    break;
                case "mouseout":
                    if ($this.hasClass("headerItem") || $this.hasClass("footerItem") || $this.hasClass("menubaritem")) {
                        $this.removeClass("mousehover");
                        if ($this.prop("tagName").toLowerCase() === "img" && $this.attr("data-index") !== "undefined") {
                            $this.parent().removeClass("mousehoverthumbnail mousehoverthumbnailimg");
                            selectedmenuitem = menubody.children("div.menubaritemwrap:eq(" + $this.attr("data-index") + ")").children("span.menubaritem:eq(0)").removeClass("mousehover");
                        } else if ($this.prop("tagName").toLowerCase() === "span" && $this.hasClass("menubaritem")) {
                            itemswrap = $(".thumbnailwrap").length > 0 ? $(".thumbnailwrap") : $(".albumwrap");
                            itemswrap.find("img.menubaritem").each(function(i, o) {
                                if ($(o).attr("data-index") === self.toStr($this.parent().index())) {
                                    $(o).parent().removeClass("mousehoverthumbnail");
                                    return false;
                                }
                            });
                        }
                    }
                    break;
                case "click":
                    if (!!!$this.attr("disabled")) {
                        if ($this.hasClass("headerItem") || $this.hasClass("footerItem")) {
                            if (self.lastSelectedThis !== null && $this !== self.lastSelectedThis) {
                                self.lastSelectedThis.removeClass("selected");
                            }
                            $this.addClass("selected");
                            self.lastSelectedThis = $this;
                            self.ids = [self.toStr($this.attr("data-id"))];
                            self.controller.navigate(self.createActionLink({"lang": Utility.enumGetKey(listLang, self.collection.lang), "type": $this.hasClass("headerItem") ? "0" : "1", "page": self.currentPageNo, "ids": self.ids}), {trigger: true});
                        } else if ($this.hasClass("menubaritem") && !!$this.data("data-info")) {
                            _item = !!$this.data("data-info") ? $this.data("data-info") : null;
                            if (!!_item) {
                                if (!!_item.thumbnail && !!this.model.toJSON().thumbnail && _item.thumbnail === this.model.toJSON().thumbnail)
                                    return;
                                if (typeof this.model.toJSON().level !== "undefined" && !!_item.level) {
                                    if (_item.level === 1 || _item.level === 2 || _item.level === 3) {
                                        _title = _item.title;
                                    } else if (_item.level === 4) {
                                        _title = _item.itname;
                                    }
                                }
                                if (typeof _item.level !== "undefined" && typeof this.model.toJSON().level !== "undefined" && _item.level === this.model.toJSON().level)
                                {
                                    self.ids[self.toInt(self.ids.length - 1)] = self.toStr(_item.id);
                                    self.titles[self.toInt(self.ids.length - 1)] = {"level": self.toInt(_item.level), "title": self.toStr(_title), "datainfo": _item};
                                }
                                else {
                                    self.ids.push(self.toStr(_item.id));
                                    self.titles.push({"level": self.toInt(_item.level), "title": self.toStr(_title), "datainfo": _item});
                                }
                            }
                            self.controller.navigate(self.createActionLink({"lang": Utility.enumGetKey(listLang, self.collection.lang), "type": "0", "page": self.currentPageNo, "ids": self.ids}), {trigger: false});
                            self.model.clear().set(_item);
                        } else if ($this.hasClass("indicatoritem")) {
                            _item = $this.data("data-info") !== null ? $this.data("data-info") : null;
                            self.titles = $.grep(self.titles, function(o, i) {
                                return  o.level <= _item.level;
                            });
                            if (self.ids.length > 0 && self.titles.length > 0) {
                                self.ids = $.grep(self.ids, function(o, i) {
                                    return  i <= (self.titles.length - 1);
                                });
                                self.controller.navigate(self.createActionLink({"lang": Utility.enumGetKey(listLang, self.collection.lang), "type": "0", "page": self.currentPageNo, "ids": self.ids}), {trigger: false});
                                self.model.clear().set(_item);
                            }
                        } else if ($this.hasClass("itemimage")) {
                            if (self.ids.length > 0) {
                                $("div#indicatordiv").children("dl:eq(0)").children("dt:eq(" + (self.ids.length - 2) + ")").click();
                            }
                        } else if ($this.hasClass("navThumbnailImg")) {
                            switch (self.toStr($this.attr("id")).toLowerCase()) {
                                case "leftnavthumbnailimg":
                                    self.currentPageNo = self.toInt(self.currentPageNo) - 1;
                                    break
                                case "rightnavthumbnailimg":
                                    self.currentPageNo = self.toInt(self.currentPageNo) + 1;
                                    break
                            }
                            if (typeof self.itemsOfPages !== "undefined" && self.itemsOfPages.length > 0 && self.currentObjwrap.length > 0) {
                                self.renderCurrentItemsPage(self.currentObjwrap, self.itemsOfPages);
                                self.controller.navigate(self.createActionLink({"lang": Utility.enumGetKey(listLang, self.collection.lang), "type": "0", "page": self.currentPageNo, "ids": self.ids}), {trigger: false});
                                self.enableEvent();
                            }
                        }
                    }
            }
            return false;
        },
        createActionLink: function(item) {
            var _url = null;
            if (item !== null && item.ids.length > 0) {
                _url = "#item/" + item.lang + "/" + item.type + "/" + item.page;
                for (var i = 0; i < item.ids.length; i++)
                {
                    _url += "/" + item.ids[i];
                }
            }
            return _url;
        },
        loadImage: function(target, path, imagefile) {
            var _img = target, mainImg = new Image();
            mainImg.src = path + imagefile;
            mainImg.onload = function() {
                _img.attr("src", mainImg.src).removeAttr('disabled');
            };
        },
        addimgslideshow: function(SSTag, loadingpath, path, imagefile, imgclass, dataid) {
            var _imgtag = null;
            if (SSTag !== null && SSTag.length > 0) {
                SSTag.append("<div><img class='" + imgclass + "' data-id='" + dataid + "' src='" + (loadingpath + imagefile) + "'></div>");
                _imgtag = SSTag.children("div").last("div").children("img:eq(0)");
                _imgtag.parent().hide();
            }
        },
        slideshow: function(SSTag, timeVal, imgNum) {
            var _sstag = SSTag, index = 1, maxindex = imgNum, _setTimeSS = null, ssli = null;
            _sstag.children(":gt(0)").hide();
            _sstag.after("<ul class='ULSlideshow'></ul>");
            _setTimeSS = window.setInterval(function() {
                _sstag.children(":eq(" + (index - 1) + ")").fadeOut(1000);
                _sstag.children(":eq(" + index + ")").fadeIn(1000);
                SSTag.siblings('ul.ULSlideshow').children("li").removeClass('active');
                SSTag.siblings('ul.ULSlideshow').children("li:eq(" + index + ")").addClass('active');
                index = index < maxindex - 1 ? index + 1 : 0;
            }, timeVal);
            for (var i = 0; i < maxindex; i++) {
                SSTag.siblings('ul.ULSlideshow').append('<li class="' + (i === 0 ? 'active' : '') + '"></li>');
            }

            ssli = SSTag.siblings('ul.ULSlideshow').children("li");
            ssli.click(function() {
                $(ssli, " .active").removeClass('active');
                $(this).addClass('active');
                window.clearInterval(_setTimeSS);
                _sstag.children("div").hide();
                _sstag.children(":eq(" + $(this).index() + ")").show();
            });
        },
        //bind
        resize: function() {
            var self = this, selectedItem = this.model.toJSON();
            var selectedSubItems = null, wraptype = null;
            if (selectedItem !== this.model.defaults && this.currentObjwrap !== null) {
                if ("StreeLs"  in selectedItem && typeof selectedItem.StreeLs !== "undefined" && selectedItem.StreeLs.length > 0) {
                    selectedSubItems = selectedItem.StreeLs.length > 0 ? selectedItem.StreeLs : null;
                    wraptype = 'album';
                } else if ("albums"  in selectedItem && typeof selectedItem.albums !== "undefined" && selectedItem.albums.length > 0) {
                    selectedSubItems = selectedItem.albums.length > 0 ? selectedItem.albums : null;
                    wraptype = 'album';
                } else if ("items"  in selectedItem && typeof selectedItem.items !== "undefined" && selectedItem.items.length > 0) {
                    selectedSubItems = selectedItem.items.length > 0 ? selectedItem.items : null;
                    wraptype = 'thumbnail';
                }
            }
            if (selectedSubItems !== null && selectedSubItems.length > 0) {
                this.currentObjwrap.empty();
                this.itemsOfPages = [];
                this.itemsOfPages = this.get_itemsOfPages(this.currentObjwrap, selectedSubItems, wraptype);
                this.renderCurrentItemsPage(this.currentObjwrap, this.itemsOfPages);
            }

            //header items with arrow
            self.renderHeaderPages();
        },
        langSelect_Change: function(e) {
            var $this = $(e.target), self = this;
            if ((!!!this.pagetype && this.pagetype !== 0) || (!!!this.pagetype && this.currentPageNo !== 0) || (!!!this.pagetype && this.ids !== 0))
                this.controller.navigate("#item/" + $this.val(), {trigger: true});
            else
                this.controller.navigate(self.createActionLink({"lang": $this.val(), "type": self.pagetype, "page": self.currentPageNo, "ids": self.ids}), {trigger: true});

        },
        mainImgClick: function(e) {
            var $this = $(e.target), self = this;
            self.ids = [self.toStr($this.attr("data-id"))];
            self.controller.navigate(self.createActionLink({"lang": Utility.enumGetKey(listLang, self.collection.lang), "type": "0", "page": "1", "ids": self.ids}), {trigger: true});
        },
        modelChanged: function(e) {
            if (typeof e.toJSON().StreeLs !== "undefined" && e.toJSON().StreeLs.length > 0 || typeof e.toJSON().albums !== "undefined" && e.toJSON().albums.length > 0 || typeof e.toJSON().items !== "undefined" && e.toJSON().items.length > 0 || typeof e.toJSON().level !== "undefined" && e.toJSON().level === 4) {
                var selectedItem = e.toJSON(), wraptype = null, self = this;
                var _title = null, _itemTitle = null;
                var indicator = $("#indicatordiv").html("<dl></dl>"), indicatormodel = null, menubarhead = $("#menubarhdiv > label"), menubody = $(".menubarbody"), itemdiaplaysection = $(".itemdisplaysection"), objwrap = null;
                var selectedSubItems = null, leftNavThumbnailImg = null, rightNavThumbnailImg = null;
                if (typeof e.toJSON().StreeLs !== "undefined" && e.toJSON().StreeLs.length > 0) {
                    wraptype = 'album';
                } else if (typeof e.toJSON().albums !== "undefined" && e.toJSON().albums.length > 0) {
                    wraptype = 'album';
                } else if (typeof e.toJSON().items !== "undefined" && e.toJSON().items.length > 0) {
                    wraptype = 'thumbnail';
                } else if (typeof e.toJSON().level !== "undefined" && e.toJSON().level === 4) {
                    wraptype = 'image';
                }

                _title = (wraptype === 'album') || (wraptype === 'thumbnail') ? selectedItem.title : selectedItem.itname;
                if (e !== this.model.defaults && indicator.length > 0 && this.titles.length > 0 && selectedItem !== null && typeof selectedItem.level !== "undefined") {
                    $.each(this.titles, function() {
                        if (indicator.children("dl:eq(0)").children('dt.selected').last('dt.selected').length > 0) {
                            indicator.children("dl:eq(0)").children('dt.selected').last('dt.selected').removeClass("selected").css("cursor", "pointer").addClass("indicator-unselected row-comd indicatoritem").attr('disabled', 'disabled').siblings("dd").html(">");
                            indicator.children("dl:eq(0)").append("<dt class='selected'>" + this.title + "</dt><dd></dd>");
                        } else {
                            indicator.children("dl:eq(0)").append("<dt class='selected'>" + this.title + "</dt><dd></dd>");
                        }
                        indicator.children("dl:eq(0)").children('dt.selected').last('dt.selected').data("data-info", this.datainfo);
                    });
                }
                if (e !== this.model.defaults && menubarhead.length > 0 && selectedItem !== null) {
                    menubarhead.html(_title);
                }

                if (wraptype === 'album') {
                    objwrap = itemdiaplaysection.html("<span class='navThumbnail' id='leftNavThumbnail'><img class='navThumbnailImg row-comd' disabled='disabled' id='leftNavThumbnailImg' src='./images/ablumarrow.png'></span><div class='albumwrap itemswrap'></div><span class='navThumbnail row-comd' disabled='disabled' id='rightNavThumbnail'><img class='navThumbnailImg row-comd' disabled='disabled' id='rightNavThumbnailImg' src='./images/ablumarrow.png'></span>");
                } else if (wraptype === 'thumbnail') {
                    objwrap = itemdiaplaysection.html("<span class='navThumbnail' id='leftNavThumbnail' ><img class='navThumbnailImg row-comd' disabled='disabled' id='leftNavThumbnailImg' src='./images/ablumarrow.png'></span><div class='thumbnailwrap itemswrap'></div><span class='navThumbnail row-comd' disabled='disabled' id='rightNavThumbnail'><img class='navThumbnailImg row-comd' disabled='disabled' id='rightNavThumbnailImg' src='./images/ablumarrow.png'></span>");
                } else if (wraptype === 'image') {
                    objwrap = itemdiaplaysection.html("<div class='itemimage'></div><div class='itemcontent'></div>");
                }

                if ((leftNavThumbnailImg = $("#leftNavThumbnailImg")).length > 0) {
                    leftNavThumbnailImg.hide();
                }
                if ((rightNavThumbnailImg = $("#rightNavThumbnailImg")).length > 0) {
                    rightNavThumbnailImg.hide();
                }

                selectedSubItems = typeof e.toJSON().StreeLs !== "undefined" && e.toJSON().StreeLs.length > 0 ? e.toJSON().StreeLs : typeof e.toJSON().albums !== "undefined" && e.toJSON().albums.length > 0 ? e.toJSON().albums : typeof e.toJSON().items !== "undefined" && e.toJSON().items.length > 0 ? e.toJSON().items : null;
                if (selectedSubItems === null) {
                    indicatormodel = indicator.children("dl:eq(0)").children("dt").map(function(i, o) {
                        if (i === (self.titles.length - 2)) {
                            return $(o).data("data-info");
                        }
                    })[0];

                    if (typeof indicatormodel.StreeLs !== "undefined" && indicatormodel.StreeLs.length > 0) {
                        selectedSubItems = indicatormodel.StreeLs;
                    } else if (typeof indicatormodel.albums !== "undefined" && indicatormodel.albums.length > 0) {
                        selectedSubItems = indicatormodel.albums;
                    } else if (typeof indicatormodel.items !== "undefined" && indicatormodel.items.length > 0) {
                        selectedSubItems = indicatormodel.items;
                    }
                }

                menubody.empty();
                if (selectedSubItems !== null && selectedSubItems.length > 0 && objwrap.length > 0) {
                    //render menubar
                    $.each(selectedSubItems, function() {
                        _itemTitle = wraptype === 'album' ? this.title : this.itname;
                        menubody.append("<div class='menubaritemwrap'><span class='row-comd menubaritem " + (this.level === 4 && this.id === selectedItem.id ? 'imgselected' : '') + "' disabled='disabled' title='" + _itemTitle + "' alt='" + _itemTitle + "'>" + _itemTitle + "</span></di>");
                        menubody.children("div.menubaritemwrap").last("div.menubaritemwrap").children("span.menubaritem:eq(0)").data("data-info", this);
                    });
                    //render item display section
                    if (wraptype !== 'image') {
                        this.currentObjwrap = objwrap.children(".itemswrap:eq(0)");
                        this.currentObjwrap.empty();
                        this.itemsOfPages = this.get_itemsOfPages(this.currentObjwrap, selectedSubItems, wraptype);
                        this.renderCurrentItemsPage(this.currentObjwrap, this.itemsOfPages);
                    } else if (wraptype === 'image') {
                        this.currentObjwrap = objwrap;
                        this.renderCurrentItemDetail(this.currentObjwrap, selectedItem, selectedSubItems);
                    }
                }
                this.enableEvent();
                return false;
            } else if (typeof e.toJSON().isweblink !== "undefined") {
                var selectedItem = e.toJSON(), self = this, footertitle = $("#label-footertitle"), footercontent = $("#pre-footercontent");
                if (e.toJSON().isweblink === 0) {
                    if (footertitle.length > 0 && typeof selectedItem.title !== "undefined") {
                        footertitle.html(self.toStr(selectedItem.title) + " :");
                    }
                    if (footercontent.length > 0 && typeof selectedItem.content !== "undefined") {
                        footercontent.html(selectedItem.content);
                    }
                } else if (e.toJSON().isweblink === 1) {
//                    window.location.href = "http://" + self.toStr(selectedItem.content);
                    window.open("http://" + self.toStr(selectedItem.content));
                }
                self.enableEvent();
                return false;
            }
        },
        renderHeaderPages: function() {
            var self = this, priHeaderdivul = $("#priHeaderdiv ul"), priHeaderdiv = $("#priHeaderdiv");
            var seriesIndexs = [], currentGroupItemsWidth = 0, lastInsertIndex = 0, currentIndex = 0, selectedIndex = 0;

            if (priHeaderdiv.length > 0 && priHeaderdivul.length > 0 && priHeaderdivul.children(":eq(0)").length > 0) {
                self.headerItemInfo.pagesItems = [];
                for (var i = 0; i < (i + 1); i++) {
                    var currentliItem = null;

                    currentliItem = priHeaderdivul.children("li.hpItem:eq(" + (currentIndex) + ")");
                    if (!(currentliItem.length > 0)) {
                        if (lastInsertIndex !== (currentIndex - 1)) {
                            self.headerItemInfo.pagesItems.push(seriesIndexs);
                        }
                        break;
                    }
                    if (self.toInt(currentliItem.children("span:eq(0)").attr("data-id")) === self.toInt(self.ids[0]) && self.pagetype === "0") {
                        selectedIndex = currentIndex;
                    }
                    seriesIndexs.push(currentIndex);

                    currentGroupItemsWidth = currentGroupItemsWidth + currentliItem.outerWidth(true);
                    if (currentGroupItemsWidth > self.priHeaderdivOffsetWidth) {
                        seriesIndexs.splice(-1, 1);
                        self.headerItemInfo.pagesItems.push(seriesIndexs);
                        seriesIndexs = [];
                        seriesIndexs.push(i);
                        currentIndex = currentIndex - 1;
                        lastInsertIndex = currentIndex - 1;
                        currentGroupItemsWidth = 0;
                    }
                    currentIndex = currentIndex + 1;
                }

                var headerpages = $("#headerpages"), hasSelectedId = false;
                headerpages.empty();
                if (headerpages.length > 0 && self.headerItemInfo.pagesItems.length > 1) {

                    for (var i = 0; i < self.headerItemInfo.pagesItems.length; i++) {
                        headerpages.append("<li class='" + (i === 0 ? 'active' : '') + "'></li>");
                    }
                    headerpages.children("li").click(function() {
                        headerpages.children("li.active").removeClass("active");
                        self.renderheaderItemInfo((self.toInt($(this).index()) + 1));
                        $(this).addClass("active");
                    });

                    for (var i = 0; i < self.headerItemInfo.pagesItems.length; i++) {
                        hasSelectedId = $.grep(self.headerItemInfo.pagesItems[i], function(o) {
                            return o === selectedIndex;
                        }).length > 0;
                        if (hasSelectedId) {
                            self.headerItemInfo.currentPage = i + 1;
                            headerpages.children("li.active").removeClass("active");
                            headerpages.children("li:eq(" + i + ")").addClass("active");
                            break;
                        }
                    }
                }
                self.renderheaderItemInfo(self.headerItemInfo.currentPage);
            }

            var _priHeaderdiv = $("#priHeaderdiv");
            if (_priHeaderdiv.length) {
                _priHeaderdiv.removeClass("chtCharFont");
                if (Utility.enumGetKey(listLang, this.collection.lang) === "cnt")
                    _priHeaderdiv.addClass("chtCharFont");
            }

        },
        renderheaderItemInfo: function(currentpage) {
            var self = this, priHeaderdivul = $("#priHeaderdiv ul");
            if (currentpage > 0) {
                priHeaderdivul.children("li.hpItem").hide();
                for (var i = 0; i < self.headerItemInfo.pagesItems[(currentpage - 1)].length; i++) {
                    priHeaderdivul.children("li.hpItem:eq(" + self.headerItemInfo.pagesItems[(currentpage - 1)][i] + ")").css("display", "inline-block");
                }
            }
        },
        disableEvent: function() {
            $(".row-comd").attr('disabled', 'disabled');
        },
        enableEvent: function() {
            $(".row-comd").removeAttr('disabled');
        },
        //accessors
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
    return MainView;
});
