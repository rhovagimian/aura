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

import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Instance;
import org.auraframework.throwable.quickfix.QuickFixException;

public interface ComponentDefRefArray {
	/**
	 * Get the underlying contents of the list as a list of components to render.
	 * @return
	 */
	List<DefinitionReference> getList();
	
	List<Instance> newInstance(BaseComponent<?, ?> fallbackValueProvider) throws QuickFixException;
	
	List<Instance> newInstance(BaseComponent<?, ?> fallbackValueProvider, Map<String, Object> extraProviders) throws QuickFixException;
	
}
