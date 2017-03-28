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
     * Verify default format.
     */
    testDefaultFormat: {
        attributes: {value : '2004-09-23'},
        test: function(component){
            $A.test.assertEquals("Sep 23, 2004", $A.test.getText(component.find('span').getElement()), "Incorrect date");
        }
    },
    /**
     * Verify default format with a date before 1970.
     */
    testDefaultFormatWithBefore1970: {
        attributes: {value : '1935-04-10'},
        test: function(component){
            $A.test.assertEquals("Apr 10, 1935", $A.test.getText(component.find('span').getElement()), "Incorrect date");
        }
    },
    /**
     * Verify behavior when 'Value' attribute is assigned an empty string.
     */
    testEmptyStringValue: {
        attributes: {value : ''},
        test: function(component){
            $A.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "Expected an empty span.");
        }
    },
    /**
     * Verify behavior when 'Value' attribute is set to undefined.
     */
    testUndefinedValue: {
        attributes: {value : '2004-09-23'},
        test: function(component){
        	component.set('v.value', undefined);
        	$A.rerender(component);
        	$A.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "Expected an empty span.");
        }
    },
    /**
     * Verify behavior when 'Value' attribute is assigned a Garbage value.
     */
    testInvalidValue: {
        attributes: {value : 'cornholio'},
        test: function(component){
            $A.test.assertEquals("cornholio", $A.test.getText(component.find('span').getElement()), "Display the original value if it is not a valid date value.");
        }
    },

    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyStringForFormat:{
        attributes: {value : '2004-09-23', format: ''},
        test:function(component){
            $A.test.assertEquals("Sep 23, 2004", $A.test.getText(component.find('span').getElement()), "Incorrect date format, should use use Aura default format.");
        }
    },

    /**
     * Verify behavior when 'format' is given a valid date format.
     */
    testFormat: {
        attributes: {value : '2004-09-23', format: 'MM dd yyyy'},
        test: function(component){
            $A.test.assertEquals("09 23 2004", $A.test.getText(component.find('span').getElement()), "Incorrect date format in display.");
      }
    },
    /**
     * Verify behavior when 'format' is given a valid date format.
     * MMMM-(Full month)
     * ww-(week of year)
     * DDD-(day of year)
     * EEEE-(day in week)
     */
    testAllPossibleFormats: {
        attributes: {value : '2004-09-23', format: 'yyyy MMMM EEEE DDD ww'},
        test: function(component){
            $A.test.assertEquals("2004 September Thursday 267 39", $A.test.getText(component.find('span').getElement()), "Incorrect date format in display.");
      }
    },

    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        attributes: {value : '2004-09-23', format: 'bb'},
        test: function(component){
            $A.test.assertEquals("bb", $A.test.getText(component.find('span').getElement()), "Expected the garbage format value.");
      }
    },

    /**
     * Verify behavior when 'langLocale' attribute is assigned a value.
     */
    testDefaultLangLocale: {
        attributes: {value : '2004-09-23', format: 'MMMM d, yyyy'},
        test: function(component){
            $A.test.assertEquals("September 23, 2004", $A.test.getText(component.find('span').getElement()), "Dates are not the same and they should be");
      }
    },

    /**
     * Verify behavior when 'langLocale' attribute is assigned a value.
     * TODO: The usage is not valid anymore. Needs to change the app's locale on the server side.
     */
    _testLangLocale: {
        attributes: {value : '2004-09-23', format: 'MMM d, yyyy', langLocale: 'fr'},
        test: function(component) {
            $A.test.assertEquals("sept. 23, 2004", $A.test.getText(component.find('span').getElement()), "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'langLocale' attribute is changed and component is rerendered.
     * TODO: The usage is not valid anymore. Needs to change the app's locale on the server side.
     */
    _testChangeLangLocale: {
        attributes: {value : '2004-09-23', format: 'MMM d, yyyy', langLocale: 'en'},
        test: function(component){
            $A.test.assertEquals("Sep 23, 2004", $A.test.getText(component.find('span').getElement()), "Dates are not the same and they should be");
            component.set("v.langLocale", "fr");
            $A.rerender(component);
            $A.test.assertEquals("sept. 23, 2004", $A.test.getText(component.find('span').getElement()), "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'langLocale' attribute is assigned an empty string.
     */
    testEmptyLangLocale:{
        attributes: {value : '2004-09-23', format: 'MMMM d, yyyy', langLocale: ''},
        test:function(component){
            $A.test.assertEquals("September 23, 2004", $A.test.getText(component.find('span').getElement()), "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'langLocale' attribute is assigned an invalid value.
     */
    testInvalidLangLocale:{
        attributes: {value : '2004-09-23', format: 'MMMM d, yyyy', langLocale: 'xx'},
        test:function(component){
            $A.test.assertEquals("September 23, 2004", $A.test.getText(component.find('span').getElement()), "Dates are not the same and they should be");
        }
    }
/*eslint-disable semi*/
})
/*eslint-enable semi*/
