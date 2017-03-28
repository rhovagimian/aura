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
package org.auraframework.impl.source.file;

import java.io.File;
import java.util.Map;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorBundleDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

import com.google.common.collect.Maps;

@ServiceComponent
public class FlavorBundleFileBundleBuilder implements FileBundleSourceBuilder {

    @Override
    public boolean isBundleMatch(File base) {
        boolean ok = false;
        for (File content : base.listFiles()) {
            String name = content.getName();
            if (name.endsWith("Flavors.css")) {
                ok = true;
            } else if (name.endsWith(".app")) {
                return false;
            } else if (name.endsWith(".cmp")) {
                return false;
            }
        }
        return ok;
    }

    @Override
    public BundleSource<?> buildBundle(File base) {
        Map<DefDescriptor<?>, Source<?>> sourceMap = Maps.newHashMap();
        String name = base.getName();
        String namespace = base.getParentFile().getName();
        DefDescriptor<FlavorBundleDef> bundleDesc = new DefDescriptorImpl<>("markup", namespace, name, FlavorBundleDef.class);

        for (File file : base.listFiles()) {
            DefDescriptor<?> descriptor = null;
            String fname = file.getName();
            if (fname.endsWith("Flavors.css")) {
                descriptor = new DefDescriptorImpl<>("css", namespace, fname.substring(0, fname.length()-4),
                        FlavoredStyleDef.class, bundleDesc);
            }
            if (descriptor != null) {
                sourceMap.put(descriptor, new FileSource<>(descriptor, file, Format.CSS));
            } else {
                // error
            }
        }
        return new BundleSourceImpl<>(bundleDesc, sourceMap, true);
    }
}
