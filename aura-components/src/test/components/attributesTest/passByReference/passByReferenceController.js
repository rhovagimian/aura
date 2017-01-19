({
    onInit: function(cmp) {
        var listByReference = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
        cmp.set("v.listByReference", listByReference);

        var mapByReference = {
                layer1: "initial1",
                oneDeeper: {
                    layer2: "initial2",
                    evenOneDeeper: {
                        layer3: "initial3"
                    }
                }
            };
        cmp.set("v.mapByReference", mapByReference);

        var objectWithList = {
                intEntry: 777,
                stringEntry: "A Large Barge",
                listEntry: ['First','Second','Third']
        };
        cmp.set("v.objectWithList", objectWithList);
    },

    changeIntOuter: function(cmp) {
        cmp.set("v.intByReference", 9999);
    },

    changeIntFacet: function(cmp) {
        cmp.find("innerCmp").set("v.intAttribute", 5565);
    },

    changeIntCreatedCmp: function(cmp) {
        var item = cmp.find("createdCmp").get("v.body.0");
        if (item) {
            item .set("v.intAttribute", 12345);
        }
    },

    changeListOuter: function(cmp) {
        var list = cmp.get("v.listByReference");
        list[2][2] = "changedOuter2b";
        cmp.set("v.listByReference", list);
        cmp.set("v.listByReference[2][2]", 'changedOuter2b');
    },

    changeListFacet: function(cmp) {
        var list = cmp.find("innerCmp").get("v.listAttribute");
        list[2][2] = "changedFacet2b";
        cmp.find("innerCmp").set("v.listAttribute", list);
    },

    appendListOuter: function(cmp) {
        var list = cmp.get("v.listByReference");
        list.push("addedOuter1d");
        cmp.set("v.listByReference", list);
    },

    appendListFacet: function(cmp) {
        var list = cmp.find("innerCmp").get("v.listAttribute");
        list.push("addedFacet1d");
        cmp.find("innerCmp").set("v.listAttribute", list);
    },

    removeItemListOuter: function(cmp) {
        var list = cmp.get("v.listByReference");
        list[list.length - 1] = undefined;
        cmp.set("v.listByReference", list);
    },

    removeItemListFacet: function(cmp) {
        var list = cmp.find("innerCmp").get("v.listAttribute");
        list[list.length - 1] = undefined;
        cmp.find("innerCmp").set("v.listAttribute", list);
    },

    changeMapOuter: function(cmp) {
        var map = cmp.get("v.mapByReference");
        map.oneDeeper.evenOneDeeper.layer3 = "changedOuter3";
        cmp.set("v.mapByReference", map);
    },

    changeMapFacet: function(cmp) {
        var map = cmp.find("innerCmp").get("v.mapAttribute");
        map.oneDeeper.evenOneDeeper.layer3 = "changedFacet3";
        cmp.find("innerCmp").set("v.mapAttribute", map);
    },

    appendMapOuter: function(cmp) {
        var map = cmp.get("v.mapByReference");
        map.oneDeeper.evenOneDeeper['layer3b'] = "addedOuter3";
        map.oneDeeper['newEntry'] = { newLayer: "addedOuter4" };
        cmp.set("v.mapByReference", map);
    },

    appendMapFacet: function(cmp) {
        var map = cmp.find("innerCmp").get("v.mapAttribute");
        map.oneDeeper.evenOneDeeper['layer3b'] = "addedFacet3";
        map.oneDeeper['newEntry'] = { newLayer: "addedFacet4" };
        cmp.find("innerCmp").set("v.mapAttribute", map);
    },

    removeMapOuter: function(cmp) {
        var map = cmp.get("v.mapByReference");
        map.oneDeeper.evenOneDeeper['layer3'] = undefined;
        cmp.set("v.mapByReference", map);
    },

    removeMapFacet: function(cmp) {
        var map = cmp.find("innerCmp").get("v.mapAttribute");
        map.oneDeeper.evenOneDeeper['layer3'] = undefined;
        cmp.find("innerCmp").set("v.mapAttribute", map);
    },

    /**
     * Getting attribute value for dynamically created component via Component.get API will pass the attribute by value.
     */
    createCmpByValue: function(cmp) {
        $A.createComponent(
            "attributesTest:passByReferenceInner",
            {
                intAttribute: cmp.get("v.intByReference"),
                listAttribute: cmp.get("v.listByReference"),
                mapAttribute: cmp.get("v.mapByReference")
            },
            function(newCmp) {
                cmp.find("createdCmp").set("v.body", [newCmp]);
            }
        );
    },
    
    /**
     * Getting attribute value for dynamically created component via Component.getReference API will pass the attribute
     * by reference.
     */
    createCmpByReference: function(cmp) {
        $A.createComponent(
            "attributesTest:passByReferenceInner",
            {
                intAttribute: cmp.getReference("v.intByReference"),
                listAttribute: cmp.getReference("v.listByReference"),
                mapAttribute: cmp.getReference("v.mapByReference")
            },
            function(newCmp) {
                cmp.find("createdCmp").set("v.body", [newCmp]);
            }
        );
    }
})


