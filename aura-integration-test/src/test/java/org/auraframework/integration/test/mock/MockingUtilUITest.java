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
package org.auraframework.integration.test.mock;

import javax.inject.Inject;

import org.auraframework.Aura;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.impl.test.mock.MockingUtil;
import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.service.CompilerService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.mock.MockModel;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mockito;
import org.openqa.selenium.By;

import com.google.common.collect.ImmutableMap;

@UnAdaptableTest("W-2329849: Failing on SFDC but passing on standalone ios-driver builds. Needs investigation")
public class MockingUtilUITest extends WebDriverTestCase {
    private MockingUtil mockingUtil;

    @Inject
    private CompilerService compilerService;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        mockingUtil = new MockingUtil(testContextAdapter, definitionService, compilerService);
    }

    @Override
    public void tearDown() throws Exception {
        Aura.getContextService().endContext();
        super.tearDown();
    }

    @Test
    public void testMockModelSanity() throws Exception {
        if (!Aura.getContextService().isEstablished()) {
            Aura.getContextService().startContext(Mode.SELENIUM, Format.HTML, Authentication.AUTHENTICATED);
        }
        DefDescriptor<ModelDef> modelDefDescriptor = definitionService
                .getDefDescriptor("java://org.auraframework.components.test.java.model.TestJavaModel", ModelDef.class);
        DefDescriptor<ApplicationDef> appDescriptor = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, String.format("model='%s'", modelDefDescriptor.getQualifiedName()),
                        "{!m.string}<aura:iteration items='{!m.stringList}' var='i'>{!i}</aura:iteration>"));
        // sanity without mocks
        open(appDescriptor);
        String actual = getText(By.cssSelector("body"));
        assertEquals("Modelonetwothree", actual);
    }

    @Ignore
    @Test
    public void testMockModelString() throws Exception {
//        if (!Aura.getContextService().isEstablished()) {
//            Aura.getContextService().startContext(Mode.SELENIUM, Format.HTML, Authentication.AUTHENTICATED);
//        }
//        DefDescriptor<ModelDef> modelDefDescriptor = definitionService.getDefDescriptor(
//                "java://org.auraframework.components.test.java.model.TestJavaModel", ModelDef.class);
//        DefDescriptor<ApplicationDef> appDescriptor = addSourceAutoCleanup(
//                ApplicationDef.class,
//                String.format(baseApplicationTag, String.format("model='%s'", modelDefDescriptor.getQualifiedName()),
//                        "{!m.string}<aura:iteration items='{!m.stringList}' var='i'>{!i}</aura:iteration>"));
//        Map<String, Object> modelProperties = ImmutableMap.of("string", (Object) "not a list");
//        mockingUtil.mockModel(modelDefDescriptor, modelProperties);
//        open(appDescriptor);
//        assertEquals("not a list", getText(By.cssSelector("body")));
    }

    @Ignore
    @Test
    public void testMockModelList() throws Exception {
//        if (!Aura.getContextService().isEstablished()) {
//            Aura.getContextService().startContext(Mode.SELENIUM, Format.HTML, Authentication.AUTHENTICATED);
//        }
//        DefDescriptor<ModelDef> modelDefDescriptor = definitionService.getDefDescriptor(
//                "java://org.auraframework.components.test.java.model.TestJavaModel", ModelDef.class);
//        DefDescriptor<ApplicationDef> appDescriptor = addSourceAutoCleanup(
//                ApplicationDef.class,
//                String.format(baseApplicationTag, String.format("model='%s'", modelDefDescriptor.getQualifiedName()),
//                        "{!m.string}<aura:iteration items='{!m.stringList}' var='i'>{!i}</aura:iteration>"));
//
//        Map<String, Object> modelProperties;
//        modelProperties = ImmutableMap.of("string", (Object) "override", "stringList",
//                Lists.newArrayList("X", "Y", "Z"));
//        mockingUtil.mockModel(modelDefDescriptor, modelProperties);
//        open(appDescriptor);
//        assertEquals("overrideXYZ", getText(By.cssSelector("body")));
    }

    @Ignore("will need to create model builders for mocks")
    @Test
    public void testMockModelChain() throws Exception {
        if (!Aura.getContextService().isEstablished()) {
            Aura.getContextService().startContext(Mode.SELENIUM, Format.HTML, Authentication.AUTHENTICATED);
        }
        DefDescriptor<ModelDef> modelDefDescriptor = definitionService.getDefDescriptor(
                "java://org.auraframework.components.test.java.model.TestJavaModel", ModelDef.class);
        DefDescriptor<ApplicationDef> appDescriptor = addSourceAutoCleanup(
                ApplicationDef.class,
                String.format(baseApplicationTag, String.format("model='%s'", modelDefDescriptor.getQualifiedName()),
                        "{!m.string}<aura:iteration items='{!m.stringList}' var='i'>{!i}</aura:iteration>"));

        // If we want to "chain" mocks (where it may be instantiated multiple times in a single request), Mockito
        // let us do it, but we don't have a convenience function for that because it shouldn't be a common case (in
        // tests)
        ModelDef modelDef = Mockito.spy(definitionService.getDefinition(modelDefDescriptor));
        mockingUtil.mockDef(modelDef);

        // chain 2 different string values followed by an exception
        MockModel model1 = new MockModel(modelDefDescriptor, ImmutableMap.of("string", (Object) "age"));
        MockModel model2 = new MockModel(modelDefDescriptor, ImmutableMap.of("string", (Object) "beauty"));
        Mockito.doReturn(model1).doReturn(model2).doThrow(new AuraRuntimeException("the afterlife")).when(modelDef)
                .newInstance();
        // rather than build another component, we'll just instantiate the same
        // component consecutively
        open(appDescriptor);
        assertEquals("age", getText(By.cssSelector("body")));
        // get url with nonce
        String newurl = getUrl(appDescriptor) + "?randomnum=" + getAuraTestingUtil().getNonce();
        open(newurl);
        assertEquals("beauty", getText(By.cssSelector("body")));
        try {
            open(appDescriptor);
            fail("didn't get the error I expected");
        } catch (AssertionError e) {
            assertTrue(e.getMessage().contains("the afterlife"));
        }
    }

    // Start with a broken component and mock to provide a "working" one.
    @Ignore
    @Test
    public void testMockServerProvider() throws Exception {
//        DefDescriptor<ProviderDef> providerDefDescriptor = definitionService.getDefDescriptor(
//                "java://org.auraframework.impl.java.provider.TestComponentConfigProvider", ProviderDef.class);
//        DefDescriptor<ComponentDef> cmpDefDescriptor = addSourceAutoCleanup(ComponentDef.class, String
//                .format(baseComponentTag, String.format("provider='%s'", providerDefDescriptor.getQualifiedName()),
//                        "<aura:attribute name='echo' type='String'/>{!v.echo}"));
//        String url = String.format("/%s/%s.cmp", cmpDefDescriptor.getNamespace(), cmpDefDescriptor.getName());//  /string/thing1.cmp
//
//        // no mocking - provider output isn't valid for this component (or any
//        // probably), but the def is valid
//        openNoAura(url);
//        assertTrue(getText(By.cssSelector("body")).contains(String.format("%s did not provide a valid component",
//                providerDefDescriptor.getQualifiedName())));
//
//        // mock provided attributes
//        ComponentConfig componentConfig = new ComponentConfig();
//        Map<String, Object> attribs = ImmutableMap.of("echo", (Object) "goodbye");
//        componentConfig.setAttributes(attribs);
//        mockingUtil.mockServerProviderDef(providerDefDescriptor, componentConfig);
//        openNoAura(url);
//        assertEquals("goodbye", getText(By.cssSelector("body")));
    }

    // Dummy controller method for use by testMockServerAction
    @ServiceComponent
    public static class InnerController implements Controller {
        @AuraEnabled
        public static Object lookInside() {
            return "not so interesting";
        }
    }

    @Test
    public void testMockServerActionSanity() throws Exception {
        if (!Aura.getContextService().isEstablished()) {
            Aura.getContextService().startContext(Mode.SELENIUM, Format.HTML, Authentication.AUTHENTICATED);
        }
        DefDescriptor<ControllerDef> controllerDefDescriptor = definitionService.getDefDescriptor(
                "java://org.auraframework.integration.test.mock.MockingUtilUITest$InnerController",
                ControllerDef.class);
        DefDescriptor<ComponentDef> cmpDefDescriptor = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("controller='%s'", controllerDefDescriptor.getQualifiedName()),
                        "<ui:button class='button' press='{!c.clicked}' label='act'/><div class='result' aura:id='result'></div>"));
        DefDescriptor<ControllerDef> clientControllerDefDescriptor = definitionService.getDefDescriptor(
                String.format("js://%s.%s", cmpDefDescriptor.getNamespace(), cmpDefDescriptor.getName()),
                ControllerDef.class);
        addSourceAutoCleanup(clientControllerDefDescriptor, "{clicked:function(component){"
                + "var a = component.get('c.lookInside');a.setCallback(component,"
                + "function(action){component.find('result').getElement().innerHTML=action.getReturnValue();});"
                + "$A.enqueueAction(a);}}");
        // sanity without mocks
        open(cmpDefDescriptor);
        assertEquals("", getText(By.cssSelector("div.result")));
        findDomElement(By.cssSelector("button.button")).click();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div.result"), "not so interesting", true);
    }

    @Ignore
    @Test
    public void testMockServerAction() throws Exception {
//        if (!Aura.getContextService().isEstablished()) {
//            Aura.getContextService().startContext(Mode.SELENIUM, Format.HTML, Authentication.AUTHENTICATED);
//        }
//        DefDescriptor<ControllerDef> controllerDefDescriptor = definitionService.getDefDescriptor(
//                "java://org.auraframework.integration.test.mock.MockingUtilUITest$InnerController", ControllerDef.class);
//        DefDescriptor<ComponentDef> cmpDefDescriptor = addSourceAutoCleanup(ComponentDef.class, String
//                .format(baseComponentTag, String.format("controller='%s'", controllerDefDescriptor.getQualifiedName()),
//                        "<ui:button press='{!c.clicked}' label='act'/><div class='result' aura:id='result'></div>"));
//        DefDescriptor<ControllerDef> clientControllerDefDescriptor = definitionService.getDefDescriptor(
//                String.format("js://%s.%s", cmpDefDescriptor.getNamespace(), cmpDefDescriptor.getName()),
//                ControllerDef.class);
//        addSourceAutoCleanup(clientControllerDefDescriptor, "{clicked:function(component){"
//                + "var a = component.get('c.lookInside');a.setCallback(component,"
//                + "function(action){component.find('result').getElement().innerHTML=action.getReturnValue();});"
//                + "$A.enqueueAction(a);}}");
//        open(cmpDefDescriptor);
//        findDomElement(By.cssSelector("button")).click();
//        waitForElementTextPresent(findDomElement(By.cssSelector("div.result")), "not so interesting");
//        // mock for different string response
//        mockingUtil.mockServerAction(controllerDefDescriptor, "lookInside", "stimulating");
//        findDomElement(By.cssSelector("button")).click();
//        waitForElementTextPresent(findDomElement(By.cssSelector("div.result")), "stimulating");
    }

}
