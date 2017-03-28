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
package org.auraframework.tools.definition;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.service.RegistryService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.DefRegistry;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Compile components into a set of static registries and write them to a file.
 *
 * This requires a components directory, an output directory, and optionally can take
 * a set of namespaces to exclude.
 *
 * Note that the output file is a binary object file that is a set of registries,
 * one per namespace, that contain all of the defs that are in the namespaces.
 */
public class RegistrySerializer {
    private static final Log log = LogFactory.getLog(RegistrySerializer.class);

    /**
     * An exception during serialization.
     */
    @SuppressWarnings("serial")
    public class RegistrySerializerException extends Exception {
        private RegistrySerializerException(String message, Throwable cause) {
            super(message, cause);
        }

        private RegistrySerializerException(String message) {
            super(message);
        }
    };

    public static interface RegistrySerializerLogger {
        public void error(CharSequence loggable);

        public void error(CharSequence loggable, Throwable cause);

        public void error(Throwable cause);

        public void warning(CharSequence loggable);

        public void warning(CharSequence loggable, Throwable cause);

        public void warning(Throwable cause);

        public void info(CharSequence loggable);

        public void info(CharSequence loggable, Throwable cause);

        public void info(Throwable cause);

        public void debug(CharSequence loggable);

        public void debug(CharSequence loggable, Throwable cause);

        public void debug(Throwable cause);
    };

    private static class DefaultLogger implements RegistrySerializerLogger {
        @Override
        public void error(CharSequence loggable) {
        }

        @Override
        public void error(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void error(Throwable cause) {
        }

        @Override
        public void warning(CharSequence loggable) {
        }

        @Override
        public void warning(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void warning(Throwable cause) {
        }

        @Override
        public void info(CharSequence loggable) {
        }

        @Override
        public void info(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void info(Throwable cause) {
        }

        @Override
        public void debug(CharSequence loggable) {
        }

        @Override
        public void debug(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void debug(Throwable cause) {
        }
    };
    
    @Nonnull
    private final DefaultLogger DEFAULT_LOGGER = new DefaultLogger();

    /**
     * componentDirectory: The base directory for components.
     */
    private final File componentDirectory;

    /**
     * outputDirectory: The directory in which to put out the .registries file.
     */
    @Nonnull
    private final File outputDirectory;

    /**
     * excluded: Namespaces to exclude.
     */
    @Nonnull
    private final String[] excluded;

    /**
     * A logger for logging information to the user.
     */
    @Nonnull
    private final RegistrySerializerLogger logger;

    @Nonnull
    private final RegistryService registryService;

    @Nonnull
    private final ConfigAdapter configAdapter;

    /**
     * A flag for an error occuring.
     */
    private boolean error = false;

    /**
     * Create a compiler instance.
     *
     * This creates a compiler for the component and output directory specified.
     *
     * @param componentDirectory the directory that we should use for components.
     * @param outputDirectory the output directory where we should write the compiled component '.registry' file.
     * @param excluded a set of excluded namespaces.
     */
    public RegistrySerializer(@Nonnull RegistryService registryService, @Nonnull ConfigAdapter configAdapter,
            @Nonnull File componentDirectory, @Nonnull File outputDirectory,
            @Nonnull String[] excluded, @CheckForNull RegistrySerializerLogger logger) {
        this.registryService = registryService;
        this.configAdapter = configAdapter;
        this.componentDirectory = componentDirectory;
        this.outputDirectory = outputDirectory;
        this.excluded = excluded;
        if (logger == null) {
            logger = DEFAULT_LOGGER;
        }
        this.logger = logger;
    }

    /**
     * write out the set of namespace registries to the given output stream.
     *
     * @param out the output stream to write into.
     * @throws RegistrySerializerException if there is an error.
     */
    public void write(@Nonnull OutputStream out) throws RegistrySerializerException {
        List<DefRegistry> regs = Lists.newArrayList();
        DefRegistry master = registryService.getRegistry(componentDirectory);

        Set<String> namespaces = master.getNamespaces();
        if (excluded != null) {
            for (String x : excluded) {
                if (!namespaces.remove(x)) {
                    throw new RegistrySerializerException("Unable to exclude "+x);
                }
            }
        }

        for (String name : namespaces) {
            regs.add(getRegistry(master, name));
        }

        ObjectOutputStream objectOut = null;
        try {
            try {
                objectOut = new ObjectOutputStream(out);
                objectOut.writeObject(regs);
            } finally {
                out.close();
            }
        } catch (IOException ioe) {
            logger.error("Unable to write out file", ioe);
            error = true;
        }
    }

    /**
     * Get a registry for the namespace given.
     *
     * This function will compile all of the root definitions in a namespace, and then get all resulting
     * definitions out of that namespace, and create a static registry suitable for serialization.
     *
     * @param namespace the namespace for which we want to retrieve a static registry.
     */
    private DefRegistry getRegistry(@Nonnull DefRegistry master, @Nonnull String namespace) {
        Set<String> prefixes = Sets.newHashSet();
        Set<DefType> types = Sets.newHashSet();
        Set<DefDescriptor<?>> descriptors;
        Map<DefDescriptor<?>, Definition> filtered = Maps.newHashMap();
        Set<String> namespaces = Sets.newHashSet(namespace);
        AuraContext context = Aura.getContextService().getCurrentContext();
        boolean modulesEnabled = context.isModulesEnabled();
        configAdapter.addInternalNamespace(namespace);
        //
        // Fetch all matching descriptors for our 'root' definitions.
        //
        logger.debug("******************************************* "+namespace+" ******************************");
        DescriptorFilter root_nsf;
		if (modulesEnabled) {
			root_nsf = new DescriptorFilter(namespace, Lists.newArrayList(DefType.MODULE));
		} else {
			root_nsf = new DescriptorFilter(namespace, Lists.newArrayList(BundleSourceImpl.bundleDefTypes));
		}
        descriptors = master.find(root_nsf);
        for (DefDescriptor<?> desc : descriptors) {
            if (modulesEnabled) {
                if (desc.getDefType() != DefType.MODULE) {
                    logger.debug("skipping non-module desc: " + desc);
                    continue;
                }
            } else {
                if (desc.getDefType() == DefType.MODULE) {
                    logger.debug("skipping module desc: " + desc);
                    continue;
                }
            }
            try {
                Definition def = master.getDef(desc);
                if (def == null) {
                    logger.error("Unable to find " + desc + "@" + desc.getDefType());
                    error = true;
                }
                types.add(desc.getDefType());
                prefixes.add(desc.getPrefix());
                logger.debug("ENTRY: " + desc + "@" + desc.getDefType().toString());
                filtered.put(desc, def);
                if (def instanceof RootDefinition) {
                    RootDefinition rd = (RootDefinition) def;
                    Map<DefDescriptor<?>, Definition> bundled = rd.getBundledDefs();
                    if (bundled != null) {
                        for (Map.Entry<DefDescriptor<?>, Definition> entry : bundled.entrySet()) {
                            logger.debug("ENTRY:\t " + entry.getKey() + "@" + entry.getKey().getDefType().toString());
                            filtered.put(entry.getKey(), entry.getValue());
                            types.add(entry.getKey().getDefType());
                            prefixes.add(entry.getKey().getPrefix());
                        }
                    }
                }
            } catch (QuickFixException qfe) {
                logger.error(qfe);
                error = true;
            }
        }
        return new StaticDefRegistryImpl(types, prefixes, namespaces, filtered.values());
    }

    public static final String ERR_ARGS_REQUIRED = "Component and Output Directory are both required";

    public void execute() throws RegistrySerializerException {
        if (componentDirectory == null || outputDirectory == null) {
            throw new RegistrySerializerException(ERR_ARGS_REQUIRED);
        }
        // Basic check... does the file exist?
        if (!componentDirectory.exists() || !componentDirectory.isDirectory()) {
            throw new RegistrySerializerException("Component directory is not a directory: "+componentDirectory);
        }
        if (!componentDirectory.canRead() || !componentDirectory.canWrite() ) {
            throw new RegistrySerializerException("Unable to read/write "+componentDirectory);
        }
        if (!outputDirectory.exists()) {
            outputDirectory.mkdirs();
        }
        if (!outputDirectory.isDirectory()) {
            throw new RegistrySerializerException("Output directory is not a directory: "+outputDirectory);
        }
        if (!outputDirectory.canWrite()) {
            throw new RegistrySerializerException("Output directory is not writable: "+outputDirectory);
        }
        File outputFile = new File(outputDirectory, ".registries");
        if (outputFile.exists()) {
            boolean deleted = outputFile.delete();
            if (!deleted && outputFile.exists()) {
                throw new RegistrySerializerException("Unable to delete and create a new file: "+outputFile);
            }
        }
        try {
            outputFile.createNewFile();
        } catch (IOException ioe) {
            throw new RegistrySerializerException("Unable to create "+outputFile);
        }

        FileOutputStream out;
        try {
            out = new FileOutputStream(outputFile);
        } catch (FileNotFoundException fnfe) {
            throw new RegistrySerializerException("Unable to create "+outputFile, fnfe);
        }
        try {
            AuraContext context = Aura.getContextService().startContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED, null);
            Boolean isModulesEnabled = Boolean.valueOf(System.getProperty("aura.modules"));
            context.setModulesEnabled(isModulesEnabled);
            try {
                write(out);
            } finally {
                Aura.getContextService().endContext();
            }
            if (error) {
                throw new RegistrySerializerException("one or more errors occurred during compile");
            }
        } finally {
            try {
                out.close();
            } catch (IOException ioe) {
                log.error(ioe);
            }
        }
    }

    /**
     * Gets the componentDirectory for this instance.
     *
     * @return The componentDirectory.
     */
    public File getComponentDirectory() {
        return this.componentDirectory;
    }

    /**
     * Gets the outputDirectory for this instance.
     *
     * @return The outputDirectory.
     */
    public File getOutputDirectory() {
        return this.outputDirectory;
    }

    /**
     * Gets the excluded for this instance.
     *
     * @return The excluded.
     */
    public String[] getExcluded() {
        return this.excluded;
    }
}
