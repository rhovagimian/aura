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
package org.auraframework.modules.impl.source;

import java.io.File;

import org.auraframework.util.AuraFiles;
import org.auraframework.util.AuraTextUtil;

/**
 * Specifies file and paths for aura modules
 */
public enum AuraModulesFiles {

    MODULES_MODULE_DIR(AuraFiles.Core.getPath(), "aura-modules"),

    MODULES_DIR(MODULES_MODULE_DIR.getPath(), "src", "main", "modules"),
    
    COMPONENTS_DIR(MODULES_MODULE_DIR.getPath(), "src", "main", "components"),

    MODULES_TEST_MODULES_DIR(MODULES_MODULE_DIR.getPath(), "src", "test", "modules"),

    MODULES_TEST_COMPONENTS_DIR(MODULES_MODULE_DIR.getPath(), "src", "test", "components");
    
    private final String path;

    AuraModulesFiles(String... path) {
        this.path = AuraTextUtil.arrayToString(path, File.separator, -1, false);
    }

    /**
     * @return the path to this File.
     */
    public String getPath() {
        return this.path;
    }

    /**
     * @return A java.util.File for this file's path
     */
    public File asFile() {
        return new File(path);
    }
}
