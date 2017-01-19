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

import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.DefFactory;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

/**
 * Doesn't do any caching at all.
 * 
 * This is a very thin wrapper around a factory, in fact, it is a little hard to
 * tell the difference. FIXME: collapse them.
 */
public class NonCachingDefRegistryImpl extends DefRegistryImpl {
    private static final long serialVersionUID = 5781588775451737960L;
    private final DefFactory<?> factory;
    private String name;

    public NonCachingDefRegistryImpl(DefFactory<?> factory, DefType defType, String prefix) {
        this(factory, Sets.newHashSet(defType), Sets.newHashSet(prefix), null);
    }

    public NonCachingDefRegistryImpl(DefFactory<?> factory, Set<DefType> defTypes, Set<String> prefixes) {
        this(factory, defTypes, prefixes, null);
    }

    public NonCachingDefRegistryImpl(DefFactory<?> factory, Set<DefType> defTypes, Set<String> prefixes,
            Set<String> namespace) {
        super(defTypes, prefixes, namespace);
        this.factory = factory;
        this.name = getClass().getSimpleName() + defTypes + prefixes + namespace;
    }

    @SuppressWarnings("unchecked")
    private <T extends Definition> DefFactory<T> getFactory(DefDescriptor<T> descriptor) {
        return (DefFactory<T>)factory;
    }

    @Override
    public <T extends Definition> T getDef(DefDescriptor<T> descriptor) throws QuickFixException {
        return getFactory(descriptor).getDef(descriptor);
    }

    @Override
    public boolean hasFind() {
        return factory.hasFind();
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        return factory.find(matcher);
    }

    @Override
    public <T extends Definition> boolean exists(DefDescriptor<T> descriptor) {
        return getFactory(descriptor).exists(descriptor);
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        return getFactory(descriptor).getSource(descriptor);
    }

    @Override
    public boolean isCacheable() {
        return false;
    }

    @Override
    public void reset() {
    }

    @Override
    public String toString() {
        return name;
    }
}
