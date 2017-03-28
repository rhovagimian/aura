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

package org.auraframework.impl.root.parser.handler.design;

import com.google.common.collect.ImmutableSet;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignTemplateDef;
import org.auraframework.def.design.DesignTemplateRegionDef;
import org.auraframework.impl.design.DesignTemplateDefImpl;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class DesignTemplateDefHandler extends ParentedTagHandler<DesignTemplateDef, DesignDef> {
    public static final String TAG = "design:template";

    private final static String ATTRIBUTE_NAME = "name";
    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME);

    private final DesignTemplateDefImpl.Builder builder = new DesignTemplateDefImpl.Builder();

    public DesignTemplateDefHandler() {
        super();
    }

    public DesignTemplateDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
                                    TextSource<?> source, boolean isInInternalNamespace, DefinitionService definitionService,
                                    ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (name == null) {
            name = ((DesignDefHandler) getParentHandler()).getNextId();
        }
        builder.setDescriptor(definitionService.getDefDescriptor(name, DesignTemplateDef.class));
        builder.setName(name);
        builder.setLocation(getLocation());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (DesignTemplateRegionDefHandler.TAG.equalsIgnoreCase(tag)) {
            DesignTemplateRegionDef templateRegion = new DesignTemplateRegionDefHandler(getParentHandler(), xmlReader,
                    source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.addDesignTemplateRegion(
                    definitionService.getDefDescriptor(templateRegion.getName(), DesignTemplateRegionDef.class),
                    templateRegion);
        } else {
            throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), tag));
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            throw new XMLStreamException(String.format(
                    "<%s> can contain only tags.\nFound text: %s",
                    getHandledTag(), text));
        }
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void finishDefinition() {
    }

    @Override
    protected DesignTemplateDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
