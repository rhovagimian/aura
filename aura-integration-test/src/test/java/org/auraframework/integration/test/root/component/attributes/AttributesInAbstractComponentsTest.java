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
package org.auraframework.integration.test.root.component.attributes;

import java.util.ArrayList;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.junit.Test;

/**
 * Automation to verify how attributes behave in abstract components.
 * 
 * @since 0.0.139
 */
public class AttributesInAbstractComponentsTest extends AuraImplTestCase {

    /**
     * Setting inherited attribute's value using value assignment in <aura:set>
     * 
     * @throws Exception
     */
    @Test
    public void testSettingAttributeValuesInChildComponent() throws Exception {
        //String markup = String.format(abstractCmpMarkup, "<aura:attribute type='String' name='text' required='true'/>");
    	String markup = "<aura:component abstract='true'><aura:attribute type='String' name='text' required='true'/></aura:component>";
        DefDescriptor<ComponentDef> abstractCmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);

    	markup = String.format("<aura:component extends='%s'><aura:set attribute='text' value='Aura'/></aura:component>", abstractCmpDesc.getQualifiedName());
        DefDescriptor<ComponentDef> extensionCmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        assertNotNull(
                "Failed to retrieve definition of extension component which was setting value of inherited attribute",
                definitionService.getDefinition(extensionCmpDesc));
        Component component = (Component) instanceService.getInstance(extensionCmpDesc.getQualifiedName(),
                ComponentDef.class);
        assertEquals("Attribute value set using value assignment does not match expected value.", "Aura", component
                .getSuper().getAttributes().getValue("text"));
    }

    /**
     * Setting inherited attribute's value in body of <aura:set></aura:set>
     * 
     * @throws Exception
     */
    @Test
    public void testSettingAttributeUsingSetBodyInChildComponent() throws Exception {
    	String markup = "<aura:component abstract='true'><aura:attribute type='Aura.Component[]' name='innerBody' required='true'/></aura:component>";
        DefDescriptor<ComponentDef> abstractCmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);

    	markup = String.format("<aura:component extends='%s'><aura:set attribute='innerBody'><aura:text value='Aura'/></aura:set></aura:component>", abstractCmpDesc.getQualifiedName());
        DefDescriptor<ComponentDef> extensionCmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        
        assertNotNull(
                "Failed to retrieve definition of extension component which was setting value of inherited attribute",
                definitionService.getDefinition(extensionCmpDesc));
        Component component = (Component) instanceService.getInstance(extensionCmpDesc.getQualifiedName(),
                ComponentDef.class);
        Object value = component.getSuper().getAttributes().getValue("innerBody");
        assertTrue(value instanceof ArrayList);
        Object innerBodycmp = ((ArrayList<?>) value).get(0);
        assertTrue(innerBodycmp instanceof Component);
        assertEquals("Setting inherited attribute in body of <aura:set></aura:set> does not work.",
                "markup://aura:text", ((Component)innerBodycmp).getDescriptor().getQualifiedName());

    }
}
