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
     * Verify creation of a preloaded component that contains an iteration.
     */
    testClientSideCmpCreationPreloaded: {
        test:function(cmp) {
            $A.createComponent(
                "iterationTest:arrayIterationPreloaded",
                {
                    "value" : ['one string', 'two string', 'red string', 'blue string']
                },
                function(newCmp) {
                    cmp.set("v.newCmp", newCmp);
                    $A.rerender(cmp);
                }
            );

            $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                var p = document.getElementsByTagName("p");
                var cmpText = $A.util.getText(p[0]);
                $A.test.assertEquals("one stringtwo stringred stringblue string", cmpText,
                    "Newly created component not showing up in DOM.");
            });
        }
    },

    /**
     * Verify creation of a non-preloaded component that contains an iteration.
     */
    testClientSideCmpCreationNotPreloaded: {
        test:function(cmp) {
            $A.run(function(){
                $A.createComponent(
                    "iterationTest:arrayIterationNotPreloaded",
                    {
                        "value": ['one string', 'two string', 'red string', 'blue string']
                    },
                    function(newCmp){
                        cmp.set("v.newCmp", newCmp);
                        $A.rerender(cmp);
                    }
                );
            });

            // Non-preloaded cmp creation will be asynchronous so add a wait here.
            $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                var p = document.getElementsByTagName("p");
                var cmpText = $A.util.getText(p[0]);
                $A.test.assertEquals("one stringtwo stringred stringblue string", cmpText,
                        "Newly created component not showing up in DOM.");
            });
        }
    }
})
