define([], function() {
    window.listLang = {
        en: 0,
        cnt: 1
    };

    var utility = {};

    utility.enumGetKey = function(ObjEnum, Value) {
        for (var key in ObjEnum) {
            if (ObjEnum.hasOwnProperty(key)) {
                if (ObjEnum[key] === Value)
                    return key;
            }
        }
    };

    utility.toInt = function(item) {
        try {
            var o = parseInt(item);
            if (!isFinite(o) || isNaN(o))
                return 0;
            return o;
        } catch (e) {
            return 0;
        }
    };

    utility.toStr = function(item) {
        var newstr = new String(item).trim();
        return (item === null || typeof(item) === "undefined" || !(item.toString())) ? "" : newstr;
    };

    return utility;
});