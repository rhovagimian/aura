({
    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],
   
    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testSecureMutationObserver: {
        test: function(cmp) {
            cmp.testSecureMutationObserver();
        }
    },

    testSecureMutationObserverFiltersRecords: {
        test: function(cmp) {
            cmp.testSecureMutationObserverFiltersRecords();
        }
    }
})