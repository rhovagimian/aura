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

function lib(w) { //eslint-disable-line no-unused-vars
    'use strict';
    w || (w = window);

    var SCROLLER = w.__S || (w.__S = {}),
        PLUGINS  = SCROLLER.plugins || (SCROLLER.plugins = {}),
        Logger   = SCROLLER.Logger,

        CONFIG_DEFAULTS = {
            labelNoData  : 'No more data to display',
            labelIdle    : '',
            labelLoading : 'Loading more...',
            threshold    : 0
        },
        CLASS_LOADING = 'loading',
        CLASS_IDLE    = 'il',

        // when zoomed, values become fractional and precision
        // is lost depending on how browsers handle it.
        // In this case, number of pixles left to scroll can be off a bit.
        // The offset is mostly less than 5.
        MIN_LOADING_THRESHOLD = 5;

    function InfiniteLoading () {}

    InfiniteLoading.prototype = {
        init: function () {
            this._mergeInfiniteLoading();
            this.on('_initialize', this._initializeInfiniteLoading);
            
            // Allows a forced reflow of this scroller through the firing of a global custom event, "FORCEREFLOW"
            document.addEventListener("FORCEREFLOW", function() { this._forceReflow(); }.bind(this));
        },
        _mergeInfiniteLoading: function () {
            this.opts.infiniteLoadingConfig = this._mergeConfigOptions(
                CONFIG_DEFAULTS,
                this.opts.infiniteLoadingConfig
            );
        },
       _createInfiniteLoadingMarkup: function () {
            var il_container = w.document.createElement('div'),
                label        = document.createElement('span'),
                idleLabel    = this.opts.infiniteLoadingConfig.labelIdle;

            label.className        = CLASS_IDLE;
            label.textContent      = idleLabel;
            il_container.className = 'infinite-loading';
            
            il_container.appendChild(label);

            return il_container;
        },
        _initializeInfiniteLoading: function () {
            var ilConfig       = this.opts.infiniteLoadingConfig,
                thresholdCheck = this.opts.gpuOptimization ? this._checkItemsthreshold : this._checkLoadingThreshold;

            if (!this.opts.infiniteLoading || !ilConfig.dataProvider) {
                Logger.log('warn', 'InfiniteLoading will not work because there is no data provider or is not activated');
                return;
            }

            this.on('scrollMove', thresholdCheck);
            this.on('scrollEnd',  thresholdCheck);
            this._itemsThreshold = this.items && this.items.length || 10;

            this._appendInfiniteLoading();
            this._setSize();
        },
        _appendInfiniteLoading: function () {
            var il_container = this._createInfiniteLoadingMarkup(),
                target       = this.scroller;

            target.appendChild(il_container);

            this.ilDOM   = il_container;
            this.ilLabel = il_container.firstChild;
            this._ilSize = il_container.offsetHeight; //relayout
        },
        _setState: function (loading) {
            this._loading = loading;
            if (loading) {
                this.ilDOM.classList.add(CLASS_LOADING);
                this.ilLabel.textContent = this.opts.infiniteLoadingConfig.labelLoading;
            } else {
                this.ilDOM.classList.remove(CLASS_LOADING);
                this.ilLabel.textContent = this.opts.infiniteLoadingConfig.labelIdle;
            }
        },
        _appendData: function (items) {
            var docfrag = w.document.createDocumentFragment(),
                scrollerContainer = this.scroller,
                container = this.ilDOM;

            items.forEach(function (i) {
                docfrag.appendChild(i);
            });

            scrollerContainer.insertBefore(docfrag, container);
        },
        _getCustomAppendedElements: function () {
            return 2;
        },
        _triggerInfiniteLoadingDataProvider: function () {
            var self            = this,
                ilDataProvider  = this.opts.infiniteLoadingConfig.dataProvider,
                callback        = function() {
                    self._infiniteLoadingTriggerCallback.apply(self, arguments);
                    Logger.log('InfiniteLoading callback called');
                };

            if (ilDataProvider) {
                Logger.log('fetching data');
                this._ilFetchingData = true;
                this._setState(true/*loading*/);
                ilDataProvider(callback);
            } else {
                this._infiniteLoadingTriggerCallback('noop');
            }
        },
        _infiniteLoadingTriggerCallback: function (payload) {
            if (payload) {
                var data = payload instanceof Array ? payload: payload.data;
                if (data && data.length) {
                    this.appendItems(payload);
                }

                if (payload === 'refresh' || payload.refresh) {
                    this.refresh();
                }

                if (payload === 'nomoredata' || payload.noMoreData) {
                    this.lockFetchData();
                }

                if (payload.labelIdle) {
                    this.opts.infiniteLoadingConfig.labelIdle = payload.labelIdle;
                }

                if (payload.labelLoading) {
                    this.opts.infiniteLoadingConfig.labelLoading = payload.labelLoading;
                }
            }

            this._setState(false/*loading*/);
            w.requestAnimationFrame(function() {
                this._ilFetchingData = false;
            }.bind(this));
        },
        // This check is done when surfaceManager is enabled
        _checkItemsthreshold: function () {
            if (this._ilNoMoreData || this._ilFetchingData) {
                return;
            }

            var lastIndex  = this._positionedSurfacesLast().contentIndex,
                count      = this.items.length - 1,
                threshold  = this._itemsThreshold;

            if (count - lastIndex < threshold) {
                this._triggerInfiniteLoadingDataProvider();
            }
        },
        // This check is done when surfaceManager is disabled
        _checkLoadingThreshold: function (action, x, y) {
            if (this._ilNoMoreData || this._ilFetchingData) {
                return;
            }

            var config = this.opts.infiniteLoadingConfig, 
                pos, size, wrapper;

            x || (x = this.x);
            y || (y = this.y);

            if (this.scrollVertical) {
                pos     = y;
                size    = this.scrollerHeight;
                wrapper = this.wrapperHeight;
            } else {
                pos     = x;
                size    = this.scrollerWidth;
                wrapper = this.wrapperWidth;
            }

            var scrollable = size - wrapper; // Total scrollable pixels
            var left = scrollable + pos; // Remaining px to scroll

            // Make sure that the provided thershold is never bigger
            // than the scrollable pixels to avoid extra provider calls
            var threshold = config.threshold < scrollable ? config.threshold : 0;
            threshold = Math.max(threshold, MIN_LOADING_THRESHOLD);

            Logger.log('left: ', left, 'tr: ', threshold);

            // If we have pixels to scroll 
            // and less than the threshold trigger provider.
            if (this.distY !== 0 && left <= threshold) {
                Logger.log('triggerDataProvider');
                this._triggerInfiniteLoadingDataProvider();
            }
        },
        /**
         * Forces this scroller to reflow after the next aura rendering cycle.
         * This is used as a workaround for a browser bug where scroller's position is improperly rendered.
         * W-3410155
         */
        _forceReflow: function() {
            this.scroller.style.position = 'fixed';
            window.setTimeout(function() {
                this.scroller.style.position = '';
            }.bind(this), 0);
        },
        /* PUBLIC API */
        fetchData: function () {
            this._triggerInfiniteLoadingDataProvider();
        },
        unlockFetchData: function () {
            this._ilNoMoreData = false;
        },
        lockFetchData: function () {
            this._ilNoMoreData = true;
        },
        updateLabels:function(payload) {
            if (typeof (payload.labelIdle) !== "undefined") {
                this.opts.infiniteLoadingConfig.labelIdle = payload.labelIdle;
            }
            if (typeof (payload.labelLoading) !== "undefined") {
                this.opts.infiniteLoadingConfig.labelLoading = payload.labelLoading;
            }
            // in order to redraw the label we have to call _setState
            this._setState(this._loading);
        }
    };

    PLUGINS.InfiniteLoading = InfiniteLoading;

}
