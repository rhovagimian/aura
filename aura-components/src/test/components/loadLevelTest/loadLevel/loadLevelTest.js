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
    testLazy: {
        attributes: {testLazy:"true"},
        test: [function(cmp){
            var helper = cmp.getDef().getHelper();
            $A.test.assertEquals("placeholder", cmp.find("lazy").getDef().getDescriptor().getName());
            helper.resumeGateId(cmp, "lazy");
            $A.test.addWaitFor("serverComponent", function(){
                return cmp.find("lazy").getDef().getDescriptor().getName();
            },function(){
                $A.test.assertTrue(cmp.find("lazy").isRendered());
                $A.test.assertTrue($A.test.getTextByComponent(cmp.find("lazy")).indexOf("Server component")!=-1);
            });
        }]
    },
    testExclusive: {
        attributes: {testExclusive:"true"},
        test: [function(cmp){
            var helper = cmp.getDef().getHelper();
            $A.test.assertEquals("placeholder", cmp.find("exclusive").getDef().getDescriptor().getName());
            helper.resumeGateId(cmp, "exclusive");
            $A.test.addWaitFor("serverComponent", function(){
                return cmp.find("exclusive").getDef().getDescriptor().getName();
            },function(){
                $A.test.assertTrue(cmp.find("exclusive").isRendered());
                $A.test.assertTrue($A.test.getTextByComponent(cmp.find("exclusive")).indexOf("Server component")!=-1);
            });
        }]
    },
    testNestedLazy: {
        attributes: {testNestedLazy:"true"},
        test: [function(cmp){
            var helper = cmp.getDef().getHelper();
            $A.test.assertEquals("placeholder", cmp.find("nestedLazy").getDef().getDescriptor().getName());
            helper.resumeGateId(cmp, "nestedLazy");
            $A.test.addWaitFor("serverWithLazyChild", function(){
                return cmp.find("nestedLazy").getDef().getDescriptor().getName();
            },function(){
                $A.test.assertTrue(cmp.find("nestedLazy").isRendered());
                $A.test.assertTrue($A.test.getTextByComponent(cmp.find("nestedLazy")).indexOf("Lazy Kid:")!=-1);

                var child = cmp.find("nestedLazy");
                var kid = child.find("kid");
                $A.test.assertEquals("placeholder", kid.getDef().getDescriptor().getName());

                helper.resumeGateId(cmp, "lazyKid");
                $A.test.addWaitFor("serverComponent", function(){
                    kid = child.find("kid");
                    return kid.getDef().getDescriptor().getName();
                },function(){
                    $A.test.assertTrue(child.find("kid").isRendered());
                    $A.test.assertTrue($A.test.getTextByComponent(child.find("kid")).indexOf("Server component")!=-1);
                });
            });
        }]
    },

    testMissingRequiredAttribute: {
        attributes: {testMissingRequiredAttribute:"true"},
        test: function(cmp) {
            var initCmpName = cmp.find("lazyWReqAttr").getType();
            $A.test.assertEquals("aura:placeholder", initCmpName);

            cmp.helper.resumeGateId(cmp, "lazyWReqAttr");

            $A.test.addWaitForWithFailureMessage("aura:text",
                function(){
                    return cmp.find("lazyWReqAttr").getType();
                },
                "Failed to get Lazy loaded component. Actual Component: " + cmp.find("lazyWReqAttr").getType(),
                function() {
                    var targetCmp = cmp.find("lazyWReqAttr");
                    $A.test.assertTrue(targetCmp.isRendered(), "Lazy loaded component didn't get rendered.");

                    var expectedMsg = "org.auraframework.throwable.quickfix.MissingRequiredAttributeException: " +
                            "COMPONENT markup://loadLevelTest:serverComponentWReqAttr is missing required attribute 'stringAttribute'";
                    var actual = $A.test.getText(targetCmp.getElement());
                    $A.test.assertTrue(actual.indexOf(expectedMsg) > -1, "The component should contain text error message: " + actual);
                });
        }
    }
})
