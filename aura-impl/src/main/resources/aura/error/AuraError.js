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
 * @description Creates an AuraError instance.
 * @constructor
 * @param {String} message - the detail message about the error.
 * @param {Object} innerError - an Error object whose properties are to be placed into AuraError.
 * @param {String} severity - the severity of the error. Aura built-in values are defined in $A.severity.
 */
function AuraError() {
    this.name       = "AuraError";
    this.message    = "";
    this.stackTrace = "";
    this.stackFrames = null;
    this.severity   = "";
    this["handled"] = false;
    this["reported"] = false;

    // the component that throws the error
    this.component = "";

    // the action that errors out
    this.action = null;

    /* port murmur32 from guava */
    var MurmurHash3 = {
        mul32: function(m, n) {
            var nlo = n & 0xffff;
            var nhi = n - nlo;
            return ((nhi * m | 0) + (nlo * m | 0)) | 0;
        },

        hashString: function(data) {
            var c1 = 0xcc9e2d51, c2 = 0x1b873593;
            var h1 = 0;
            var len = data.length;
            for (var i = 1; i < len; i += 2) {
                var k1 = data.charCodeAt(i - 1) | (data.charCodeAt(i) << 16);
                k1 = this.mul32(k1, c1);
                k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);  // ROTL32(k1,15);
                k1 = this.mul32(k1, c2);

                h1 ^= k1;
                h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19);  // ROTL32(h1,13);
                h1 = (h1 * 5 + 0xe6546b64) | 0;
            }

            if((len % 2) === 1) {
                k1 = data.charCodeAt(len - 1);
                k1 = this.mul32(k1, c1);
                k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);  // ROTL32(k1,15);
                k1 = this.mul32(k1, c2);
                h1 ^= k1;
            }

            // finalization
            h1 ^= (len << 1);

            // fmix(h1);
            h1 ^= h1 >>> 16;
            h1  = this.mul32(h1, 0x85ebca6b);
            h1 ^= h1 >>> 13;
            h1  = this.mul32(h1, 0xc2b2ae35);
            h1 ^= h1 >>> 16;

            return h1;
        }
    };

    /* parse error to create stack frames */
    function getStackFrames(e) {
        var remove = 0;
        if (!e || !e.stack) {
            try {
                throw new Error("foo");
            } catch (f) {
                e = f;
                remove += 3;
            }
        }

        return Aura.Errors.StackParser.parse(e).slice(remove);
    }

    /* analyze stack frames to create meaningful trace */
    function getStackTrace(frames) {
        var filtered = frames.filter(function(frame) {
            return !frame.fileName || frame.fileName.match(/aura_[^\.]+\.js$/gi) === null;
        });

        // if all stack frames are from framework, we still want to keep the trace.
        return filtered.length > 0 ? filtered.join('\n') : frames.join('\n');
    }

    var generateErrorId = function(stacktrace) {

        function getStackTraceIdHashString(traces) {
            var ret = [];
            var lines = traces.split('\n');
            lines.forEach(function(line) {
                line = line.replace(/https?:\/\/([^\/]*\/)+/gi, "");
                line = line.replace(/:[0-9]+:[0-9]+/gi, "");
                ret.push(line);
            });

            return ret.join('\n')+"\n";
        }

        return MurmurHash3.hashString(getStackTraceIdHashString(stacktrace));
    };

    function AuraErrorInternal(message, innerError, severity) {
        if (message == null) {
            message = '';
        }

        this.name = innerError ? innerError.name : this.name;
        this.message = message + (innerError ? " [" + (innerError.message || innerError.toString()) + "]" : "");
        this.stackFrames = getStackFrames(innerError);
        this.stackTrace = getStackTrace(this.stackFrames);
        this.id = generateErrorId(this.stackTrace);
        this.severity = innerError ? (innerError.severity || severity) : severity;
        this["handled"] = innerError ? (innerError["handled"] || false) : false;
        this["reported"] = innerError ? (innerError["reported"] || false) : false;
    }

    AuraErrorInternal.apply(this,arguments);

    this["name"] = this.name;
    this["message"] = this.message;
    this["stackTrace"] = this.stackTrace;
    this["severity"] = this.severity;
    this["data"] = null;
    this["id"] = this.id;
    this.generateErrorId = generateErrorId;
}

AuraError.prototype = new Error();
AuraError.prototype.constructor = AuraError;
AuraError.prototype.toString = function() {
    return this.message || Error.prototype.toString();
};

/**
 * When there is need to mess with stacktrace, call this method
 * so that the error id will be recalculated
 * @function
 * @param {String} trace - The trace to be set to this error instance.
 */
AuraError.prototype.setStackTrace = function(trace) {
    this.stackTrace = trace;
    this.id = this.generateErrorId(trace);
};

Aura.Errors.AuraError = AuraError;
