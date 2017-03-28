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
    logRenderEvent : function(cmp, event) {
        var evtToken = event.getParam("event")
        var log = cmp.find("log").getElement();
        if(!log )
            return;
        var span = document.createElement("span");
        $A.util.setText(span, evtToken+"");
        $A.util.insertFirst(span, log);

        var isInDomLog = cmp.find("isInDomLog").getElement();
        var element = cmp.getElement();
        var isInDom = $A.util.contains(document.body, element);
        
        $A.util.setText(isInDomLog, isInDom+"");
    },

    destroy : function(cmp, event) {
        var targetCmp = cmp.find("root");
        targetCmp && targetCmp.destroy();
    }
})
