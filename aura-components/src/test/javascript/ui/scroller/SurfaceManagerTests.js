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
Function.RegisterNamespace("Test.Components.Ui.Scroller");	

[Fixture]
Test.Components.Ui.Scroller.SurfaceManager=function(){

	var targetHelper,
		scrollerNS,
		windowMock=Test.Mocks.NeededMocks.getWindowMock();
	
	windowMock(function(){
		var callback = function (path, fn) {fn();};
		ImportJson("aura-components/src/main/components/ui/scrollerLib/bootstrap.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/browserSupport.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/browserStyles.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/helpers.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/CubicBezier.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/ScrollerJS.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/SurfaceManager.js", callback);
		ImportJson("aura-components/src/main/components/ui/scroller/scrollerHelper.js",function(path,result){
			targetHelper=result;
		});
		scrollerNS=targetHelper.getScrollerNamespace();
	});
	
	var surfaceManager;
	windowMock(function(){
		
		surfaceManager=new scrollerNS.SurfaceManager();
		surfaceManager.opts={
			pullToRefresh:false,
			pullToLoadMore:false
		};
		surfaceManager._getCustomAppendedElements = function () {return 0};
		
		surfaceManager.scroller=Stubs.Dom.GetNode({
			id:'scroller',
			_isScrolling:false
		},
		null,
		[Stubs.Dom.GetNode({
			id:'child1'
		})]);
		
	});

	var fnMocks=Mocks.GetMocks(surfaceManager, Stubs.GetObject({
		"on":function(eventType,fn,context){
			fn.apply(surfaceManager);
		},
		"_stopMomentum":function(){},
		"_setWrapperSize":function(){},
		"_scrollTo":function(x,y,time,easing){},
		"testPullToShowMore":function(){},
		//pull out of this generic mock.. especially if you want to test _destroy
		"_destroySurfaceManager":function(){}
	}));
	
	[Fixture]
	function Resize(){
		
		[Fact]
		function DoesResizeScroller(){
			var called=0;

			fnMocks(function(){
				windowMock(function(){
					surfaceManager.init();
					surfaceManager.resize();
					called=window.requestAnimationFrame.Calls.length;
				});
				
			});

			Assert.True(called===1);
		}
	}

	[Fixture]
	function ManipulateDOM(){

		[Fact]
		function PrependItems(){
			var value,
				domStubAlias=Stubs.Dom;
			fnMocks(function(){
				windowMock(function(){
					surfaceManager.init();
					surfaceManager.prependItems([domStubAlias.GetNode({id:"prepended-1"}),domStubAlias.GetNode({id:"prepended-2"})]);
					value=(surfaceManager.items[0].dom.id==="prepended-2" && surfaceManager.items[1].dom.id==="prepended-1");
				});
			});

			Assert.True(value);
		}
	}

	[Fixture]
	function UpdatingSurface(){

		[Fact]
		function SmallGestureNoUpdate_PTL(){
			var _setInfiniteScrollerSize_called=false;
			var mock=Mocks.GetMocks(surfaceManager,Stubs.GetObject({
				"_getPosition":function(vertical){
					return {
						pos  : -0.3333333333, //pull up
                    	dist : -11, //needs to be > 10/-10
                    	size : 698,
                    	maxScroll : 277
					};
				},
				"_getSurfaceTotalOffset":function(surface){
					return 421;
				},
				"_getBoundaries":function(currentPos, currentSize){
					return {'bottom':1315};
				},
				"_itemsLeft":function(end){
					return false;
				},
				"_setInfiniteScrollerSize":function(){
					_setInfiniteScrollerSize_called=true;
				}
			}));

			var returnValue;
			mock(function(){
				returnValue=surfaceManager._updateSurfaceManager();
			});

			Assert.False(_setInfiniteScrollerSize_called);
		}
	}
}