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
/**
 * @description Global Value Provider. Holds global values: $Label, $Browser, $Locale, etc
 *
 * The interface required of a global value provider is:
 * <ul>
 *   <li>merge: merge a set of values from the server (if values come from the server)
 *   <li>get: get a single value from the GVP
 *   <li>getStorableValues[optional] get a storable version of the GVP values
 *   <li>getValues: get a set of values that can be exposed.
 *   <li>set[optional]: set a value on the provider
 *   <li>isStorable[optional]: should values be saved to storage
 * </ul>
 *
 * @param {Object} gvp an optional serialized GVP to load.
 * @param {Function} initCallback an optional callback invoked after the GVP has finished its
 *  asynchronous initialization.
 * @constructor
 * @export
 */
function GlobalValueProviders (gvp, initCallback) {
    this.valueProviders = {
        "$Browser" : new Aura.Provider.ObjectValueProvider(gvp["$Browser"]),
        "$Label": new Aura.Provider.LabelValueProvider(gvp["$Label"]),
        "$Locale": new Aura.Provider.ObjectValueProvider(gvp["$Locale"]),
        "$Global": new Aura.Provider.ContextValueProvider(gvp["$Global"])
    };

    for(var type in gvp){
        if (["$Browser", "$Label", "$Locale", "$Global"].indexOf(type) >= 0) {
            continue;
        }

        $A.assert(this.valueProviders[type]==null,"$A.globalValueProviders.ctor(): '"+type+"' has already been registered.");
        // work around the obfuscation logic to allow external GVPs
        var valueProvider = gvp[type];
        valueProvider.getValues = valueProvider.getValues || valueProvider["getValues"];
        valueProvider.get       = valueProvider.get       || valueProvider["get"];
        valueProvider.merge     = valueProvider.merge     || valueProvider["merge"];
        this.valueProviders[type] = valueProvider;
    }

    var that = this;
    this.loadFromStorage(function() {
        that.load(gvp);
        if (initCallback) {
            initCallback(that);
        }
    });
}

/**
 * Persistent storage key for GVPs.
 */
GlobalValueProviders.prototype.STORAGE_KEY = "globalValueProviders";


/**
 * Key to use of the MutexLocker to guarantee atomic execution across tabs.
 */
GlobalValueProviders.prototype.MUTEX_KEY = "GlobalValueProviders";

/**
 * Function to release the mutex, set while the mutex is held.
 */
GlobalValueProviders.prototype.mutexUnlock = undefined;

/**
 * Set to true while GVP persistence is async acquiring the lock, enabling
 * concurrent GVP updates to skip their own persistence calls.
 */
GlobalValueProviders.prototype.persistenceQueued = false;

/**
 * True if GVPs were loaded from persistent storage. */
GlobalValueProviders.prototype.LOADED_FROM_PERSISTENT_STORAGE = false;


/**
 * Merges new GVPs with existing and saves to storage
 *
 * @param {Array} gvps The new GVPs to merge. Provided as an array of objects,
 *  where each object has two keys: "type" and "values".
 * @param {Boolean} doNotPersist
 * @protected
 */
GlobalValueProviders.prototype.merge = function(gvps, doNotPersist) {
    if (!gvps) {
        return;
    }
    var valueProvider, i, type, newGvp, values;

    for (i = 0; i < gvps.length; i++) {
        newGvp = gvps[i];
        type = newGvp["type"];
        if (!this.valueProviders[type]) {
            this.valueProviders[type] = new Aura.Provider.ObjectValueProvider();
        }
        valueProvider = this.valueProviders[type];
        if (valueProvider.merge) {
            // set values into its value provider
            valueProvider.merge(newGvp["values"]);
        }else{
            $A.util.apply(valueProvider,newGvp["values"],true);
        }
        $A.expressionService.updateGlobalReferences(type,newGvp["values"]);
    }

    if (doNotPersist) {
        return;
    }

    var storage = this.getStorage();
    if (!storage) {
        return;
    }

    // if another task is already queued to persist then rely on it to
    // include values just merged.
    if (this.persistenceQueued) {
        return;
    }

    this.persistenceQueued = true;

    // for multi-tab support a single persistent store is shared so it's possible other tabs have updated
    // the persisted GVP value. therefore lock, load, merge, save, and unlock.
    var that = this;
    $A.util.Mutex.lock(that.MUTEX_KEY, function (unlock) {
        that.mutexUnlock = unlock;
        storage.get(that.STORAGE_KEY, true)
            .then(
                undefined,
                function(e) {
                    $A.warning("GlobalValueProvider.merge(), failed to load GVP values from storage, will overwrite storage with in-memory values, error:" + e);
                    // do not rethrow
                }
            )
            .then(function(value) {
                // collect GVP values to persist. this includes updates to the GVPs
                // incurred while waiting for the mutex, etc.
                that.persistenceQueued = false;
                var toStore = [];
                for (type in that.valueProviders) {
                    if (that.valueProviders.hasOwnProperty(type)) {
                        valueProvider = that.valueProviders[type];
                        // GVP values saved to storage be default. isStorable allows it to not be stored
                        var storable = typeof valueProvider["isStorable"] === "function" ? valueProvider["isStorable"]() : true;
                        if (storable) {
                            values = valueProvider.getStorableValues ? valueProvider.getStorableValues() : (valueProvider.getValues ? valueProvider.getValues() : valueProvider);
                            toStore.push({"type": type, "values": values});
                        }
                    }
                }

                if (value) {
                    // NOTE: we merge into the value from storage to avoid modifying toStore, which may hold
                    // references to mutable objects from the live GVPs (due to getValues() etc above). this means
                    // the live GVPs don't see the additional values from storage.
                    try {
                        var j;
                        var map = {};
                        for (j in value) {
                            map[value[j]["type"]] = value[j]["values"];
                        }


                        for (j in toStore) {
                            type = toStore[j]["type"];
                            if (!map[type]) {
                                map[type] = {};
                                value.push({"type":type, "values":map[type]});
                            }
                            $A.util.apply(map[type], toStore[j]["values"], true, true);
                        }

                        toStore = value;
                    } catch (err) {
                        $A.warning("GlobalValueProvider.merge(), merging from storage failed, overwriting with in-memory values, error:" + err);
                    }
                }
                return storage.set(that.STORAGE_KEY, toStore);
            })
            .then(
                function() {
                    that.mutexUnlock();
                },
                function(err) {
                    $A.warning("GlobalValueProvider.merge(), failed to put, error:" + err);
                    that.mutexUnlock();
                }
            );
    });
};


/**
 * Wrapper to get storage.
 *
 * @return {Object} storage - undefined if no storage exists
 * @private
 */
GlobalValueProviders.prototype.getStorage = function () {
    var storage = Action.getStorage();
    if (!storage) {
        return undefined;
    }

    return storage.isPersistent() ? storage : undefined;
};

/**
 * load GVPs from storage if available
 * @private
 */
GlobalValueProviders.prototype.loadFromStorage = function(callback) {
    // If persistent storage is active then write through for disconnected support
    var storage = this.getStorage();
    if (!storage) {
        callback();
        return;
    }

    var that = this;
    storage.get(this.STORAGE_KEY, true)
        .then(function (value) {
                $A.run(function() {
                    if (value) {
                        that.merge(value, true);

                        // some GVP values were loaded from storage
                        that.LOADED_FROM_PERSISTENT_STORAGE = true;
                    }

                    callback();
                });
        })
        .then(
            undefined,
            function() {
                $A.run(function() {
                    // error retrieving from storage
                    callback();
                });
            }
        );
};

/**
 * Loads GVP config when from context
 *
 * @param {Object} gvp Global Value Providers
 * @private
 */
GlobalValueProviders.prototype.load = function(gvp) {
    if (gvp) {
        for ( var i = 0; i < gvp.length; i++) {
            this.merge(gvp[i]);
        }
    }
};


/**
 * Adds a new global value provider.
 * @param type The key to identify the valueProvider.
 * @param valueProvider The valueProvider to add.
 * @private
 */
GlobalValueProviders.prototype.addValueProvider = function(type, valueProvider) {
    if(!this.valueProviders.hasOwnProperty(type)) {
        // work around the obfuscation logic to allow external GVPs
        valueProvider.getValues = valueProvider.getValues || valueProvider["getValues"];
        valueProvider.get       = valueProvider.get       || valueProvider["get"];
        valueProvider.merge     = valueProvider.merge     || valueProvider["merge"];
        this.valueProviders[type] = valueProvider;
    }
};

/**
 * Returns value provider or empty ObjectValueProvider
 *
 * @param {String} type the key to identify the valueProvider
 * @return {Object} ValueProvider
 * @private
 */
GlobalValueProviders.prototype.getValueProvider = function(type) {
    return this.valueProviders[type];
};

/**
 * Calls getValue for Value Object. Unwraps and calls callback if provided.
 *
 * @param {String} expression
 * @param {Component} component
 * @return {String} The value of expression
 * @export
 */
GlobalValueProviders.prototype.get = function(expression, callback) {
    expression=$A.expressionService.normalize(expression).split('.');
    var type=expression.shift();
    var valueProvider=this.valueProviders[type];
    $A.assert(valueProvider,"Unknown value provider: '"+type+"'.");
    return (valueProvider.get ? valueProvider.get(expression, callback) : $A.expressionService.resolve(expression, valueProvider));
};

Aura.Provider.GlobalValueProviders = GlobalValueProviders;
