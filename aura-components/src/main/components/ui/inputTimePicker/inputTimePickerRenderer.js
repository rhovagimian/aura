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
    afterRender: function (component, helper) {
        var visible = component.get("v.visible");
        if (visible === true) {
            if (component.get("v._timeListInitialized") === false) {
                helper.renderList(component);
                component.set("v._timeListInitialized", true);
            }

            helper.position(component);
        }
        helper.updateGlobalEventListeners(component);
        helper.setEventHandlers(component);
        this.superAfterRender();
    },

    rerender: function (component, helper) {
        this.superRerender();
        var visible = component.get("v.visible");
        if (visible === true) {
            var shouldRerender = component.get("v._timeListInitialized") === false || component.isDirty("v.interval");
            if (shouldRerender) {
                helper.renderList(component);
                component.set("v._timeListInitialized", true);
            }
            helper.position(component);
        }
        helper.updateGlobalEventListeners(component);
    },

    unrender: function (component, helper) {
        if (component.positionConstraint) {
            component.positionConstraint.destroy();
        }
        helper.removeEventHandlers(component);
        this.superUnrender();
    }
})// eslint-disable-line semi
