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
 * @description The Action Definition including the name, descriptor, action type, method, and parameter definitions. An
 *            ActionDef instance is created as part of the ControllerDef initialization.
 *
 * @constructor
 * @param {Object}
 *            config
 * @export
 */
function ActionDef(config) {
    this.name = config["name"];
    this.descriptor = config["descriptor"];
    this.actionType = config["actionType"];
    this.meth = null;
    this.paramDefs = {};
    this.background = false;
    this.caboose = false;

    if (this.actionType === "SERVER") {
        this.returnType = config["returnType"]&&config["returnType"]["name"];

        var params = config["params"];
        if (!!params && $A.util.isArray(params)) {
            for ( var i = 0; i < params.length; i++) {
                this.paramDefs[params[i]["name"]] = params[i];
            }
        }
        if (config["background"]) {
            this.background = true;
        }
        if (config["caboose"]) {
            this.caboose = true;
        }
    }

    else if (this.actionType === "CLIENT") {
        try {
            this.meth = $A.util.json.decodeString(config["code"]);
        } catch (e) {
            throw new $A.auraError("ActionDef ctor decode error: " + config["code"], e, $A.severity.QUIET);
        }
    }
}

/**
 * Gets the name of this Action. The name is the unique identifier that the component can use to call this Action.
 *
 * @returns {String}
 * @export
 */
ActionDef.prototype.getName = function() {
    return this.name;
};

/**
 * Gets the Action Descriptor.
 *
 * @returns {String} descriptor of ActionDef
 * @private
 */
ActionDef.prototype.getDescriptor = function() {
    return this.descriptor;
};

/**
 * Gets the Action type, which can either be "CLIENT" or "SERVER".
 *
 * @returns {String} Possible values are "CLIENT" or "SERVER".
 * @private
 */
ActionDef.prototype.getActionType = function() {
    return this.actionType;
};

/**
 * Returns true if the Action type is client-side, or false otherwise.
 *
 * @public
 * @returns {!boolean}
 * @export
 */
ActionDef.prototype.isClientAction = function() {
    return this.actionType === "CLIENT";
};

/**
 * Returns true if the Action type is server-side, or false otherwise.
 *
 * @public
 * @returns {!boolean}
 * @export
 */
ActionDef.prototype.isServerAction = function() {
    return this.actionType === "SERVER";
};

/**
 * Returns true if the action is defined as background (i.e. @BackgroundAction on the java class)
 * @protected
 * @returns {!boolean}
 */
ActionDef.prototype.isBackground = function() {
    return this.background === true;
};

/**
 * Returns true if the action is defined as 'force boxcar' (i.e. @CabooseAction on the java class)
 * @protected
 * @returns {!boolean}
 */
ActionDef.prototype.isCaboose = function() {
    return this.caboose === true;
};

/**
 * Returns a new Action instance.
 *
 * @param {Object}
 *            cmp The component associated with the Action.
 * @returns {Action}
 * @private
 */
ActionDef.prototype.newInstance = function(cmp) {
    return new Action(this, "a", this.meth, this.paramDefs, this.background, cmp, this.caboose);
};

/**
 * Get a reasonable string representation of the def.
 */
ActionDef.prototype.toString = function() {
    return this.descriptor.toString();
};

Aura.Controller.ActionDef = ActionDef;
