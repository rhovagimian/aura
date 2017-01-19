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
package org.auraframework.impl.system;

import java.io.Serializable;
import java.util.Set;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.DefRegistry;

import com.google.common.collect.Sets;

public abstract class DefRegistryImpl implements DefRegistry, Serializable {
    private static final long serialVersionUID = 1011408241457411660L;
    private final Set<DefType> defTypes;
    private final Set<String> prefixes;
    private final Set<String> namespaces;

    public DefRegistryImpl(Set<DefType> defTypes, Set<String> prefixes, Set<String> namespaces) {
        this.defTypes = defTypes;
        this.prefixes = Sets.newHashSet();
        for (String prefix : prefixes) {
            this.prefixes.add(prefix.toLowerCase());
        }
        if (namespaces == null) {
            this.namespaces = Sets.newHashSet("*");
        } else {
            this.namespaces = namespaces;
        }
    }

    @Override
    public Set<DefType> getDefTypes() {
        return defTypes;
    }

    @Override
    public Set<String> getPrefixes() {
        return prefixes;
    }

    @Override
    public Set<String> getNamespaces() {
        return namespaces;
    }

    @Override
    public boolean isStatic() {
        return false;
    };
}
