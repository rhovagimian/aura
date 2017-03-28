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

import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;

import javax.annotation.Nonnull;

/**
 * An interface to retrieve source for descriptors.
 *
 * This interface has an implementation for each of the supported sources in Aura. It can be implemented 
 * by consumers of aura to provide additional ways to access sources (and provide definitions), e.g. a database.
 */
public interface SourceLoader {

    /**
     * Returns a list of namespaces for which this loader is authoritative.
     * 
     * @return List of names of namespaces that this SourceLoader handles.
     */
    @Nonnull
    Set<String> getNamespaces();
    
    /**
     * Returns a list of prefixes (java/js/apex) for which this loader is
     * authoritative within the namespaces returned by getNamespaces.
     * 
     * @return List of prefixes that this SourceLoader handles.
     */
    @Nonnull
    Set<String> getPrefixes();

    /**
     * Returns a list of DefTypes for which this loader is authoritative within
     * the namespaces returned by getNamespaces and the prefixes returned by
     * getPrefixes.
     */
    @Nonnull
    Set<DefType> getDefTypes();

    /**
     * Return the Source for the given descriptor.
     * 
     * @param descriptor
     * @return Source referenced by descriptor
     */
    <D extends Definition> Source<D> getSource(@Nonnull DefDescriptor<D> descriptor);

    /**
     * Match descriptors against a matcher.
     */
    Set<DefDescriptor<?>> find(@Nonnull DescriptorFilter dm);

    /**
     * Reset the internals of the source loader (for filesystem changed for example).
     */
    void reset();
}
