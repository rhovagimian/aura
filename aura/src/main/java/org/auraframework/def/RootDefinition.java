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
package org.auraframework.def;

import java.util.List;
import java.util.Map;

import org.auraframework.instance.Versionable;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * RootDefinitions are the Definitions that can be defined at the top-level of markup. This includes things like
 * component, interface, and event. The common trait of all of these types is that they can include AttributeDefs.
 */
public interface RootDefinition extends Definition, Versionable {
    public enum SupportLevel {
        PROTO, DEPRECATED, BETA, GA
    }

    @Override
    DefDescriptor<? extends RootDefinition> getDescriptor();

    /**
     * @return just the attributes declared on this definition
     */
    Map<DefDescriptor<AttributeDef>, AttributeDef> getDeclaredAttributeDefs();

    /**
     * @return all the attributes for this component, including those inherited from a super component
     * @throws QuickFixException
     */
    Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException;
    
    /**
     * @return all the required versions for this component
     * @throws QuickFixException
     */
    Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs();

    /**
     * @param name
     * @return The named AttributeDef
     * @throws QuickFixException
     */
    AttributeDef getAttributeDef(String name) throws QuickFixException;
    
    /**
     * @param namespace
     * @return The RequiredVersionDef for the given namespace
     */
    RequiredVersionDef getRequiredVersion(String namespace);

    /**
     * This is used to validate by the compiler to validate EventDefRefs.
     * 
     * @return all the events this component can fire, including those inherited
     * @throws QuickFixException
     */
    Map<String, RegisterEventDef> getRegisterEventDefs() throws org.auraframework.throwable.quickfix.QuickFixException;

    boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException;

    DefDescriptor<? extends ProviderDef> getProviderDescriptor() throws QuickFixException;

    ProviderDef getProviderDef() throws QuickFixException;

    @Deprecated
    List<DefDescriptor<?>> getBundle();

    ProviderDef getLocalProviderDef() throws QuickFixException;

    SupportLevel getSupport();

    DocumentationDef getDocumentationDef() throws QuickFixException;

    Map<DefDescriptor<?>, Definition> getBundledDefs();

    /**
     * Get a single def that is bundled into this root definition.
     */
    <X extends Definition> X getBundledDefinition(DefDescriptor<X> descriptor);
}
