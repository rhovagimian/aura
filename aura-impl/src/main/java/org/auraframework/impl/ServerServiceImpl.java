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
package org.auraframework.impl;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.StyleDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.json.Json;

import com.google.common.collect.Sets;

public class ServerServiceImpl implements ServerService {

    private static final long serialVersionUID = -2779745160285710414L;

    @Override
    public void run(Message message, AuraContext context, Writer out, Map<?,?> extras) throws IOException {
        LoggingService loggingService = Aura.getLoggingService();
        if (message == null) {
            return;
        }
        List<Action> actions = message.getActions();
        Json json = Json.createJsonStream(out, context.getJsonSerializationContext());
        try {
            json.writeMapBegin();
            if (extras != null && extras.size() > 0) {
                for (Map.Entry<?,?> entry : extras.entrySet()) {
                    json.writeMapEntry(entry.getKey(), entry.getValue());
                }
            }
            json.writeMapKey("actions");
            json.writeArrayBegin();
            run(actions, json);
            json.writeArrayEnd();

            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeMapEntry("context", context);
                List<Event> clientEvents = Aura.getContextService().getCurrentContext().getClientEvents();
                if (clientEvents != null && !clientEvents.isEmpty()) {
                    json.writeMapEntry("events", clientEvents);
                }
                json.writeMapEnd();
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
            }
        } finally {
            json.close();
        }
    }

    private void run(List<Action> actions, Json json) throws IOException {
        LoggingService loggingService = Aura.getLoggingService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        for (Action action : actions) {
            StringBuffer actionAndParams = new StringBuffer(action.getDescriptor().getQualifiedName());
            KeyValueLogger logger = loggingService.getKeyValueLogger(actionAndParams);
            if (logger != null) {
                action.logParams(logger);
            }
            String aap = actionAndParams.toString();
            loggingService.startAction(aap);
            Action oldAction = context.setCurrentAction(action);
            try {
                //
                // We clear out action centric references here.
                //
                json.clearReferences();
                // DCHASMAN TODO Look into a common base for Action
                // implementations that we can move the call to
                // context.setCurrentAction() into!
                action.run();
            } catch (AuraExecutionException x) {
                Aura.getExceptionAdapter().handleException(x, action);
            } finally {
                context.setCurrentAction(oldAction);
                loggingService.stopAction(aap);
            }
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeArrayEntry(action);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
            }

            List<Action> additionalActions = action.getActions();

            // Recursively process any additional actions created by the
            // action
            if (additionalActions != null && !additionalActions.isEmpty()) {
                run(additionalActions, json);
            }
        }
    }

    @Override
    public void writeAppCss(Set<DefDescriptor<?>> dependencies, Writer out) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        DefDescriptor<?> appDesc = context.getLoadingApplicationDescriptor();
        final String uid = context.getUid(appDesc);
        final String key = "CSS:" + context.getClient().getType() + "$" + mKey + uid;

        context.setPreloading(true);

        if (context.getOverrideThemeDescriptor() == null && appDesc != null
                && appDesc.getDefType() == DefType.APPLICATION) {
            ApplicationDef app = ((ApplicationDef) appDesc.getDef());
            context.setOverrideThemeDescriptor(app.getOverrideThemeDescriptor());
        }

        String cached = context.getDefRegistry().getCachedString(uid, appDesc, key);
        if (cached == null) {
            Collection<StyleDef> orderedStyleDefs = filterAndLoad(StyleDef.class, dependencies, null);
            StringBuffer sb = new StringBuffer();
            Aura.getSerializationService().writeCollection(orderedStyleDefs, StyleDef.class, sb, "CSS");
            cached = sb.toString();
            context.getDefRegistry().putCachedString(uid, appDesc, key, cached);
        }
        out.append(cached);
    }

    @Override
    public void writeDefinitions(Set<DefDescriptor<?>> dependencies, Writer out)
            throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";
        //
        // create a temp buffer in case anything bad happens while we're processing this.
        // don't want to end up with a half a JS init function
        //
        // TODO: get rid of this buffering by adding functionality to Json.serialize that will help us
        // make sure serialized JS is valid, non-error-producing syntax if an exception happens in the
        // middle of serialization.
        //

        context.setPreloading(true);
        DefDescriptor<?> applicationDescriptor = context.getLoadingApplicationDescriptor();
        final String uid = context.getUid(applicationDescriptor);
        final String key = "JS:" + mKey + uid;
        String cached = context.getDefRegistry().getCachedString(uid, applicationDescriptor, key);

        if (cached == null) {

            StringBuilder sb = new StringBuilder();

            sb.append("$A.clientService.initDefs({");

            // append component definitions
            sb.append("componentDefs:");
            Collection<BaseComponentDef> defs = filterAndLoad(BaseComponentDef.class, dependencies, null);
            Aura.getSerializationService().writeCollection(defs, BaseComponentDef.class, sb, "JSON");
            sb.append(",");

            // append event definitions
            sb.append("eventDefs:");
            Collection<EventDef> events = filterAndLoad(EventDef.class, dependencies, null);
            Aura.getSerializationService().writeCollection(events, EventDef.class, sb, "JSON");
            sb.append(",");

            //
            // append controller definitions
            // Dunno how this got to be this way. The code in the Format adaptor was twisted and stupid,
            // as it walked the namespaces looking up the same descriptor, with a string.format that had
            // the namespace but did not use it. This ends up just getting a single controller.
            //
            sb.append("controllerDefs:");
            Collection<ControllerDef> controllers = filterAndLoad(ControllerDef.class, dependencies, ACF);
            Aura.getSerializationService().writeCollection(controllers, ControllerDef.class, sb, "JSON");

            sb.append("});");

            cached = sb.toString();
            // only use closure compiler in prod mode, due to compile cost
            if (minify) {
                StringWriter sw = new StringWriter();
                List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_SIMPLE.compress(cached, sw, key);
                if (errors == null || errors.isEmpty()) {
                    // For now, just use the non-compressed version if we can't get
                    // the compression to work.
                    cached = sw.toString();
                }
            }
            context.getDefRegistry().putCachedString(uid, applicationDescriptor, key, cached);
        }

        out.append(cached);
    }

    @Override
    public void writeComponents(Set<DefDescriptor<?>> dependencies, Writer out)
            throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        context.setPreloading(true);
        Aura.getSerializationService().writeCollection(filterAndLoad(BaseComponentDef.class, dependencies, null),
                BaseComponentDef.class, out);
    }

    /**
     * Provide a better way of distinguishing templates from styles..
     * 
     * This is used to apply the style definition filter for 'templates', but is getting rather further embedded in
     * code.
     * 
     * TODO: W-1486762
     */
    private static interface TempFilter {
        public boolean apply(DefDescriptor<?> descriptor);
    }

    private static class AuraControllerFilter implements TempFilter {
        @Override
        public boolean apply(DefDescriptor<?> descriptor) {
            return descriptor.getPrefix().equalsIgnoreCase("aura") && descriptor.getDefType() == DefType.CONTROLLER;
        }
    }

    private static final AuraControllerFilter ACF = new AuraControllerFilter();

    private <P extends Definition, D extends P> Set<D> filterAndLoad(Class<D> defType,
            Set<DefDescriptor<?>> dependencies, TempFilter extraFilter) {

        Set<D> out = Sets.newLinkedHashSet();
        MasterDefRegistry mdr = Aura.getContextService().getCurrentContext().getDefRegistry();

        try {
        for (DefDescriptor<?> descriptor : dependencies) {
            if (defType.isAssignableFrom(descriptor.getDefType().getPrimaryInterface())
                    && (extraFilter == null || extraFilter.apply(descriptor))) {
                @SuppressWarnings("unchecked")
                DefDescriptor<D> dd = (DefDescriptor<D>) descriptor;
                out.add(mdr.getDef(dd));
            }
        }
        } catch (QuickFixException qfe) {
            // This should never happen here, by the time we are filtering our set, all dependencies
            // MUST be loaded. If not, we have a serious bug that must be addressed.
            throw new IllegalStateException("Illegal state, QFE during write", qfe);
        }
        return out;
    }
}
