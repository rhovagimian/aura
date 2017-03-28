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
        KRIS: These cannot be commented out, they are used by other components and applications. until they have their own renderer, this needs to stay. 
        Todo:
        1. Everyone who uses aura.component as it's renderer should get their own renderers.
        2. Those renderers should be blank for simple compoments
        3. Other renderers should basically be a copy of whats in here.
        4. Remove these methods but keep this file since it's needed because of the server renderer.
      **/


    render: function(component){
        var rendering = component.getRendering();
        return rendering||$A.renderingService.renderFacet(component,component.get("v.body"));
    },

    afterRender: function(component){
        var body = component.get("v.body");
        $A.afterRender(body);
    },

    rerender: function(component){
        var body = component.get("v.body");
        return $A.renderingService.rerenderFacet(component,body);
    },

    unrender : function(component){
        var body = component.get("v.body");
        $A.renderingService.unrenderFacet(component,body);
    }
})/*eslint-disable semi*/
