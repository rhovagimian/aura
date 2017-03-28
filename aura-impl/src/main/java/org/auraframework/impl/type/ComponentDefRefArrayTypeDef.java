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
 */
package org.auraframework.impl.type;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.component.ComponentDefRefArrayImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.List;
import java.util.Set;

/**
 * typedef that allows for defrefs to be passed around without being automatically instantiated
 * 
 * @since 0.0.234
 */
public class ComponentDefRefArrayTypeDef extends DefinitionImpl<TypeDef> implements TypeDef {

    private static final long serialVersionUID = 643481536140031335L;

    protected ComponentDefRefArrayTypeDef(Builder builder) {
        super(builder);
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<TypeDef> {

        public Builder() {
            super(TypeDef.class);
            setDescriptor(new DefDescriptorImpl<>("aura://Aura.ComponentDefRef[]", TypeDef.class, null));
            setLocation(getDescriptor().getQualifiedName(), -1);
            setAccess(new DefinitionAccessImpl(AuraContext.Access.GLOBAL));
        };

        @Override
        public ComponentDefRefArrayTypeDef build() {
            return new ComponentDefRefArrayTypeDef(this);
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeString(getName());
    }

    @Override
    public Object valueOf(Object stringRep) {
        return stringRep;
    }

    @Override
    public Object wrap(Object o) {
        return o;
    }

    @Override
    public Object getExternalType(String prefix) throws QuickFixException {
        return ComponentDefRef[].class;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Object initialize(Object config, BaseComponent<?, ?> valueProvider) throws QuickFixException {
        if (config != null && config instanceof List) {
            return new ComponentDefRefArrayImpl((List<DefinitionReference>)config, valueProvider);
        }
        return config;
    }

    @Override
    public void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) {
        @SuppressWarnings("unchecked")
        List<ComponentDefRef> value = (List<ComponentDefRef>) instance;
        for (ComponentDefRef componentDefRef : value) {
            componentDefRef.appendDependencies(deps);
        }
    }
}
