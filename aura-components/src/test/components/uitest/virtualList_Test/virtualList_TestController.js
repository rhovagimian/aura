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
	replaceData : function(cmp, evt, helper) {
		cmp.find("provider").set("v.empty", false);
		cmp.find("provider").getEvent("provide").fire();
	},
	
	emptyData : function(cmp, evt, helper) {
		cmp.find("provider").set("v.empty", true);
		cmp.find("provider").getEvent("provide").fire();
	},
	
	sendTemplateMap : function(cmp, evt, helper) {
	    helper.generateItemTemplates(cmp);
	    cmp.find("list").set("v.templateMap", cmp.get("v.templateMap"));
	}
})