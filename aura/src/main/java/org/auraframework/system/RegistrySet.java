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
package org.auraframework.system;

import java.util.Collection;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;

/**
 * An interface that defines a set of registries for resolving definitions.
 *
 * This interface is implemented internally to provide a fast reliable way to get a registry either for a
 * given descriptor, or a registry for a filter. The collections returned here should be considered immutable,
 * and may throw if you attempt to modify them.
 */
public interface RegistrySet {
    /**
     * Get the list of all registries.
     *
     * This list of registries should be a 'set' in the sense that there would be one registry for any given
     * descriptor, and there should be no duplicates in the list.
     *
     * @return an immutable list of registries.
     */
    public Collection<DefRegistry> getAllRegistries();

    /**
     * Get a set of registries for a given descriptor filter.
     *
     * @param matcher the filter for which we need registries.
     * @return an immutable collection of registries.
     */
    public Collection<DefRegistry> getRegistries(DescriptorFilter matcher);

    /**
     * Get a registry for a given descriptor.
     *
     * @param descriptor the descriptor for which we need a registry.
     * @return the registry corresponding to the descriptor.
     */
    public <T extends Definition> DefRegistry getRegistryFor(DefDescriptor<T> descriptor);
}
