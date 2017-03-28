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
package org.auraframework.impl.root.parser.handler;

import com.google.common.collect.ImmutableSet;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ExampleDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.documentation.ExampleDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class ExampleDefHandler<P extends RootDefinition> extends ParentedTagHandler<ExampleDefImpl, P> {

    public static final String TAG = "aura:example";

    public static final String ATTRIBUTE_REF = "ref";
    public static final String ATTRIBUTE_NAME = "name";
    public static final String ATTRIBUTE_LABEL = "label";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_REF, ATTRIBUTE_NAME,
            ATTRIBUTE_LABEL);

    private final StringBuilder body = new StringBuilder();

    private final ExampleDefImpl.Builder builder = new ExampleDefImpl.Builder();

    public ExampleDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                             boolean isInInternalNamespace, DefinitionService definitionService,
                             ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);

        builder.setLocation(getLocation());
        builder.setAccess(getAccess(isInInternalNamespace));
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String ref = getAttributeValue(ATTRIBUTE_REF);
        if (AuraTextUtil.isNullEmptyOrWhitespace(ref)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_REF, TAG);
        }
        builder.setRef(ref);

        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_NAME, TAG);
        }
        builder.setName(name);

        String label = getAttributeValue(ATTRIBUTE_LABEL);
        if (AuraTextUtil.isNullEmptyOrWhitespace(label)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_LABEL, TAG);
        }
        builder.setLabel(label);

        DefDescriptor<P> parentDesc = getParentHandler().getDefDescriptor();
        String exampleName = String.format("%s_%s", parentDesc.getDescriptorName(), name);
        builder.setDescriptor(definitionService.getDefDescriptor(exampleName, ExampleDef.class));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        body.append(handleHTML());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        body.append(handleHTMLText());
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
        builder.setDescription(body.toString());
    }

    @Override
    protected ExampleDefImpl createDefinition() throws QuickFixException {
        return builder.build();
    }
}
