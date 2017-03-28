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
 

// DVAL: HALO: FIXME: All this test shoul be refactored once the refactor the component.

Function.RegisterNamespace("Test.Components.Ui.AutocompleteList");

[Fixture]
Test.Components.Ui.AutocompleteList.AutocompleteListHelperTest=function(){
	var targetHelper = null;
	
	ImportJson("aura-components/src/main/components/ui/autocompleteList/autocompleteListHelper.js",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
    function matchText(){
    	[Fact]
		function MatchTextWithExactlyOneMatch(){
			// Arrange
			var actual = null;
			
			var testItems = [{label : "target one", keyword : "", visible : "false"},
				{label : "target two", keyword : "", visible : "false"}];
				
			var expected = [{label : "target one", keyword : "target o", visible : "true"},
				{label : "target two", keyword : "target o", visible : "false"}];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "target o";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					} else if (expression === "v.propertyToMatch") {
						return "label";
					}
				},
				set : function(expression, value) {
					if (expression === "v.privateItems") {
						actual = value;	
					}
				},
				find: function () {
					return {
						get: function() {
							return [];
						}
					};
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){},
				showLoading : function(cmp, value){},
				fireMatchDoneEvent : function(cmp, value){}
			});
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
    	[Fact]
		function MatchTextWithMultipleMatches(){
			// Arrange
			var actual = null;
			
			var testItems = [{label : "target one", keyword : "", visible : "false"},
				{label : "target two", keyword : "", visible : "false"}];
				
			var expected = [{label : "target one", keyword : "target", visible : "true"},
				{label : "target two", keyword : "target", visible : "true"}];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "target";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					} else if (expression === "v.propertyToMatch") {
						return "label";
					}
				},
				set : function(expression, value) {
					if (expression === "v.privateItems") {
						actual = value;	
					}
				},
				find: function () {
					return {
						get: function() {
							return [];
						}
					};
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){},
				showLoading : function(cmp, value){},
				fireMatchDoneEvent : function(cmp, value){}
			});
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
		[Fact]
		function MatchTextWithZeroMatches(){
			// Arrange
			var actual = null;
			
			var testItems = [{label : "target one", keyword : "", visible : "false"},
				{label : "target two", keyword : "", visible : "false"}];
				
			var expected = [{label : "target one", keyword : "xxx", visible : "false"},
				{label : "target two", keyword : "xxx", visible : "false"}];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "xxx";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					} else if (expression === "v.propertyToMatch") {
						return "label";
					}
				},
				set : function(expression, value) {
					if (expression === "v.privateItems") {
						actual = value;	
					}
				},
				find: function () {
					return {
						get: function() {
							return [];
						}
					};
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){},
				showLoading : function(cmp, value){},
				fireMatchDoneEvent : function(cmp, value){}
			});
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
		[Fact]
		function MatchTextWithZeroItemsToSearch(){
			// Arrange
			var actual = null;
			var testItems = [];
			var expected = [];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "target";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					} else if (expression === "v.propertyToMatch") {
						return "label";
					}
				},
				set : function(expression, value) {
					if (expression === "v.privateItems") {
						actual = value;	
					}
				},
				find: function () {
					return {
						get: function() {
							return [];
						}
					};
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){},
				showLoading : function(cmp, value){},
				fireMatchDoneEvent : function(cmp, value){}
			});
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
		[Fact]
		function MatchTextWithDifferentPropertyToMatch(){
			// Arrange
			var actual = null;
			
			var testItems = [{custom: "match me 1", label : "target one", keyword : "", visible : "false"},
				{custom: "match me 2", label : "target two", keyword : "", visible : "false"}];
				
			var expected = [{custom: "match me 1", label : "target one", keyword : "1", visible : "true"},
				{custom: "match me 2", label : "target two", keyword : "1", visible : "false"}];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "1";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					} else if (expression === "v.propertyToMatch") {
						return "custom";
					}
				},
				set : function(expression, value) {
					if (expression === "v.privateItems") {
						actual = value;	
					}
				},
				find: function () {
					return {
						get: function() {
							return [];
						}
					};
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){},
				showLoading : function(cmp, value){},
				fireMatchDoneEvent : function(cmp, value){}
			});
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
    }
}