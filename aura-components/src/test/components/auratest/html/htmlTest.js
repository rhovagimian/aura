/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    /**
     * Anchors with href without fragment are rendered as is.
     */
    testAnchorNoFragment: {
        test: function(component){
            var tag = component.find("nohash").getElement();
            $A.test.assertEquals("salesforce", $A.test.getText(tag), "textContent not expected");
            $A.test.assertTrue($A.test.contains(tag.href, "http://www.salesforce.com/"), "href not expected");
        }
    },

    /**
     * Anchors with href with only hash are rendered with modified href.
     */
    testAnchorFragment: {
        test: function(component){
            var expected = window.location.href + "#";
            var tag = component.find("hash").getElement();
            $A.test.assertEquals("hash", $A.test.getText(tag), "textContent not expected");
            $A.test.assertEquals(expected, tag.href, "href not expected");
        }
    },

    /**
     * Anchors with href with fragment are rendered with modified href.
     */
    testAnchorFragmentString: {
        test: function(component){
            var expected = window.location.href + "#layout";
            var tag = component.find("hashString").getElement();
            $A.test.assertEquals("layout", $A.test.getText(tag), "textContent not expected");
            $A.test.assertEquals(expected, tag.href, "href not expected");
        }
    },

    testOnMouseOverMouseOutEventFiring: {
        test: function(component){
            var anchorA = component.find("testAnchorA");

            $A.test.fireDomEvent(anchorA.getElement(), "mouseover");
            $A.test.assertEquals("true", component.get("v.mouseOverEvent"), "onmouseover event did not get fired.");

            $A.test.fireDomEvent(anchorA.getElement(), "mouseout");
            $A.test.assertEquals("false", component.get("v.mouseOutEvent"), "onmouseout event did not get fired.");
        }
    },

    /**
     * Area with href should not render modified href with or without hash
     */
    testAreaNoFragment:{
        test: function(component){
            var tag = component.find("noHashArea").getElement();
            $A.test.assertEquals("http://www.salesforce.com/", tag.href, "Area href not expected");
        }
    },

    testAreaFragment:{
        test: function(component){
            var tag = component.find("hashStringArea").getElement();
            var expectedHrefValue = "#layout"
            $A.test.assertTrue(tag.href.substr(tag.href.length-expectedHrefValue.length) === expectedHrefValue);
        }
    },

    testAreaFragmentString:{
        test: function(component){
            var tag = component.find("hashArea").getElement();
            var expectedHrefValue = "#";
            $A.test.assertTrue(tag.href.substr(tag.href.length-expectedHrefValue.length) === expectedHrefValue);
        }
    },

    /**
     * Break tags are output as single self-contained tags.
     */
    testBreak: {
        test: function(component){
            var elems = component.find("hasBr").getElement().getElementsByTagName("br");
            $A.test.assertEquals(1, elems.length, "should only be 1 br tag");
            $A.test.assertEquals(0, elems[0].children.length, "br should not have any children");
        }
    },

    /**
     * Attributes on HTML tags are case-insensitive.
     */
    testAttributeCasing: {
        test: function(component){
            var tag = component.find("case").getElement();
            $A.test.assertTrue(typeof tag.ReadOnly === "undefined" && tag.readOnly === false, "readOnly was not cased properly");
            $A.test.assertTrue(typeof tag.maxlength === "undefined" && tag.maxLength == 11, "maxLength was not cased properly");
            $A.test.assertTrue(typeof tag.AccessKey === "undefined" && tag.accessKey === "x", "accessKey was not cased properly");
            $A.test.assertTrue(typeof tag.TABINDEX === "undefined" && tag.tabIndex === 1, "tabIndex was not cased properly");
            $A.test.assertTrue(typeof tag.ColSpaN === "undefined" && tag.colSpan === "2", "colSpan was not cased properly");
            $A.test.assertTrue(typeof tag.rOWsPAN === "undefined" && tag.rowSpan === "2", "rowSpan was not cased properly");
            $A.test.assertTrue(typeof tag.BGColor === "undefined" && tag.bgColor === "#FFFFFF", "bgColor was not cased properly");
            $A.test.assertTrue(typeof tag.USEmap === "undefined" && tag.useMap === "true", "useMap was not cased properly");
            $A.test.assertTrue(typeof tag.Class === "undefined" && tag.className === "low", "className was not converted properly");
            $A.test.assertTrue(typeof tag.FOR === "undefined" && tag.htmlFor === "ground", "htmlFor was not converted properly");
            $A.test.assertTrue(typeof tag.PLACEHOLDER === "undefined" && tag.placeholder === "Casper", "placeholder was not cased properly");
            $A.test.assertTrue(typeof tag.ValuE === "undefined" && tag.value === "infamous ghost", "value was not cased properly");
        }
    },

    assertClassUpdate : function(component, newValue) {
        component.set("v.classValue", newValue);
        $A.rerender(component);
        $A.test.assertEquals(newValue ? newValue : "", component.find("hasClass").getElement().className);
    },

    /**
     * class attribute will be rerendered when initially not set
     */
    testRerenderAddedClassAttribute: {
    	test: function(component) {
    		$A.test.assertEquals("", component.find("hasClass").getElement().className, "initial class not set");
    		this.assertClassUpdate(component, "inner");
    	}
    },

    /**
     * class attribute can be removed and restored in rerender
     */
    testRerenderUpdatedClassAttribute: {
    	attributes: { classValue : "upper" },
    	test: function(component) {
            $A.test.assertEquals("upper", component.find("hasClass").getElement().className, "initial class not set");
            this.assertClassUpdate(component, "");
            this.assertClassUpdate(component, "middle");
            this.assertClassUpdate(component, null);
            this.assertClassUpdate(component, "lower");
            this.assertClassUpdate(component);
    	}
    },

    /**
     * Verify rerender of special html attributes
     * type, href, style and data attributes must be set by using setAttribute() on dom elements
     */
    testRerenderSpecialHtmlAttributes:{
        test:function(component){
            var input = component.find("specialAttributes_input").getElement();
            var styleText;

            $A.test.assertEquals("textElement" , input.getAttribute("data-name"), "Failed to render data attribute");

            //
            // Warning! IE7 returns an object for style, so this first attempt fails because replace doesn't exist.
            //
            try {
                styleText = input.getAttribute("style").replace(/[ ;]/g,"").toLowerCase();
            } catch (e) {
                styleText = input.style.cssText.replace(/[ ;]/g,"").toLowerCase();
            }
            $A.test.assertEquals("color:blue" , styleText);

            var a = component.find("specialAttributes_a").getElement();
            $A.test.assertTrue($A.test.contains(a.getAttribute("href"), "http://bazinga.com/"),
                "Failed to render href attribute for 'http://bazinga.com'");

            component.set("v.style", "color:green");
            component.set("v.dataName", "inputElement");
            component.set("v.href", "http://bbt.com/");

            $A.rerender(component);
            input = component.find("specialAttributes_input").getElement();
            $A.test.assertEquals("inputElement" , input.getAttribute("data-name"), "Failed to rerender data attribute");

            //
            // Warning! IE7 returns an object for style, so this first attempt fails because replace doesn't exist.
            //
            try {
                styleText = input.getAttribute("style").replace(/[ ;]/g,"").toLowerCase();
            } catch (e) {
                styleText = input.style.cssText.replace(/[ ;]/g,"").toLowerCase();
            }
            $A.test.assertEquals("color:green" , styleText);

            a = component.find("specialAttributes_a").getElement();
            $A.test.assertTrue($A.test.contains(a.getAttribute("href"), "http://bbt.com/"),
                "Failed to render href attribute for 'http://bbt.com'");
        }
    },

    /**
     * Change type of input element (non-IE)
     */
    testChangeTypeOfInputElement:{
    	browsers: ["-IE7","-IE8","-IE9"],
        test:function(component){
            var input = component.find("specialAttributes_input").getElement();
            $A.test.assertEquals("text" , input.getAttribute("type"), "Failed to render type attribute");
            component.set("v.type", "input");
            $A.rerender(component);
            input = component.find("specialAttributes_input").getElement();
            $A.test.assertEquals("input" , input.getAttribute("type"), "Failed to rerender type attribute");
        }
    },

    testIFrame: {
        test: function(cmp) {
            var frame = cmp.find("frame").getElement();
            $A.test.assertTrue(frame.frameborder === undefined && frame.frameBorder == 0 || frame.frameBorder === "0",
                "frameBorder attribute is case sensitive");
        }
    },

    testContextPath: {
        test: [
            function(cmp) {
                $A.getContext().setContextPath("/cool");
                var img = cmp.find("img");
                img.set("v.src", "/auraFW/resources/aura/images/logo.png");
            },
            function(cmp) {
                $A.getContext().setContextPath("");
                var el = cmp.find("img").getElement().getElementsByTagName("img")[0];
                $A.test.assertTrue(el.src.indexOf("/cool/auraFW/resources/aura/images/logo.png") !== -1,
                    "Aura url should include context path");
            }]
    },

    testOnClickIsCaseSensitive : {
        browsers : [ 'GOOGLECHROME', 'FIREFOX' ],
        test : function(component) {
            $A.test.assertEquals(0, component.get("v.clickCount"));
            component.find("anchor").getElement().click();
            $A.test.assertEquals(1, component.get("v.clickCount"), "onclick was not fired/handled");
            
            // If the following handler was bound (unexpectedly), it should throw an error when executed
            component.find("hasBadOnClickHandler").getElement().click();
        }
    }
})
