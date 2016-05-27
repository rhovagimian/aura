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
package org.auraframework.impl.test;

import java.util.concurrent.TimeUnit;

import javax.inject.Inject;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.test.TestableLocalizationAdapter;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

/**
 * Keep track of the current test.
 */
public class TestContextAdapterImpl implements TestContextAdapter {

    @Configuration
    public static class TestConfiguration {
    	
        private static TestContextAdapter testContextAdapter = new TestContextAdapterImpl();

        /**
         * Use a true singleton TestContextAdapter for tests, because integration tests may execute outside the server's
         * ApplicationContext.
         */
        @Lazy
        @Bean
        @Scope(BeanDefinition.SCOPE_SINGLETON)
        public TestContextAdapter testContextAdapter() {
        	return testContextAdapter;
        }
    }
    
    Cache<String, TestContext> allContexts = CacheBuilder.newBuilder().concurrencyLevel(8)
            .expireAfterAccess(30, TimeUnit.MINUTES).maximumSize(100).build();

    private final ThreadLocal<TestContext> testContext = new ThreadLocal<>();
    
    @Inject
    private LocalizationAdapter localizationAdapter;
    
    @Override
    public TestContext getTestContext() {
        return testContext.get();
    }

    @Override
    public TestContext getTestContext(String name) {
        TestContext context = allContexts.getIfPresent(name);
        if (context == null) {
            context = new TestContextImpl(name);
            allContexts.put(name, context);
        }
        testContext.set(context);
        
        this.setupTestLabels();
        
        return context;
    }

    @Override
    public void clear() {
        testContext.set(null);
        
        tearDownTestLabels();
    }

    @Override
    public void release() {
        TestContext context = testContext.get();
        if (context != null) {
            allContexts.invalidate(context.getName());
            context.getLocalDefs().clear();
        }
        clear();
    }
    
    private void setupTestLabels() {
    	if(localizationAdapter instanceof TestableLocalizationAdapter) {
    		TestableLocalizationAdapter testableAdapter = (TestableLocalizationAdapter) localizationAdapter;
    		testableAdapter.setTestLabel("AuraTestLabelSection", "dynamic_label_for_test", "we have {0} members");
    		testableAdapter.setTestLabel("AuraTestLabelSection", "label_for_attribute_default_value_test", "testing label");
    		testableAdapter.setTestLabel("Section1", "controller", "Controller");
    		testableAdapter.setTestLabel("Section2", "controller", "Controller");
    		testableAdapter.setTestLabel("Section_A", "controller", "Controller");
    		testableAdapter.setTestLabel("Section1", "helper", "Helper");
    		testableAdapter.setTestLabel("Section2", "helper", "Helper");
    		testableAdapter.setTestLabel("ML_Comment", "helper", "Helper");
    		testableAdapter.setTestLabel("SL_Comment", "helper", "Helper");
    		testableAdapter.setTestLabel("Section_a", "helper", "Helper");
    		testableAdapter.setTestLabel("Section_B", "helper", "Helper");
    		testableAdapter.setTestLabel("Section5", "helper", "Helper");
    		testableAdapter.setTestLabel("Section1", "provider", "Provider");
    		testableAdapter.setTestLabel("Section2", "provider", "Provider");
    		testableAdapter.setTestLabel("Section3", "provider", "Provider");
    		testableAdapter.setTestLabel("Section1", "renderer", "Renderer");
    		testableAdapter.setTestLabel("Section2", "renderer", "Renderer");
    		testableAdapter.setTestLabel("Section3", "renderer", "Renderer");
    		testableAdapter.setTestLabel("Section1", "library", "Library1");
    		testableAdapter.setTestLabel("Section2", "library", "Library2");
    		testableAdapter.setTestLabel("Section1", "badlibrary", "BadLibrary1");
    		testableAdapter.setTestLabel("Section2", "badlibrary", "BadLibrary2");
    		testableAdapter.setTestLabel("SectionJsonTest_s", "s", "serialId");
    		testableAdapter.setTestLabel("SectionJsonTest_sid", "sid", "serialIdShort");
    		testableAdapter.setTestLabel("SectionJsonTest_r", "r", "serialRefId");
    		testableAdapter.setTestLabel("SectionJsonTest_rid", "rid", "serialRefIdShort");    		
    	}
    }
    
    private void tearDownTestLabels() {
    	if(localizationAdapter instanceof TestableLocalizationAdapter) {
    		TestableLocalizationAdapter testableAdapter = (TestableLocalizationAdapter) localizationAdapter;
	    	testableAdapter.removeTestLabel("AuraTestLabelSection", "dynamic_label_for_test");
	    	testableAdapter.removeTestLabel("AuraTestLabelSection", "label_for_attribute_default_value_test");
	    	testableAdapter.removeTestLabel("Section1", "controller");
	    	testableAdapter.removeTestLabel("Section2", "controller");
	    	testableAdapter.removeTestLabel("Section_A", "controller");
	    	testableAdapter.removeTestLabel("Section1", "helper");
	    	testableAdapter.removeTestLabel("Section2", "helper");
	    	testableAdapter.removeTestLabel("ML_Comment", "helper");
	    	testableAdapter.removeTestLabel("SL_Comment", "helper");
	    	testableAdapter.removeTestLabel("Section_a", "helper");
	    	testableAdapter.removeTestLabel("Section_B", "helper");
	    	testableAdapter.removeTestLabel("Section5", "helper");
	    	testableAdapter.removeTestLabel("Section1", "provider");
	    	testableAdapter.removeTestLabel("Section2", "provider");
	    	testableAdapter.removeTestLabel("Section3", "provider");
	    	testableAdapter.removeTestLabel("Section1", "renderer");
	    	testableAdapter.removeTestLabel("Section2", "renderer");
	    	testableAdapter.removeTestLabel("Section3", "renderer");
	    	testableAdapter.removeTestLabel("Section1", "library");
	    	testableAdapter.removeTestLabel("Section2", "library");
	    	testableAdapter.removeTestLabel("Section1", "badlibrary");
	    	testableAdapter.removeTestLabel("Section2", "badlibrary");
	    	testableAdapter.removeTestLabel("SectionJsonTest_s", "s");
	    	testableAdapter.removeTestLabel("SectionJsonTest_sid", "sid");
	    	testableAdapter.removeTestLabel("SectionJsonTest_r", "r");
	    	testableAdapter.removeTestLabel("SectionJsonTest_rid", "rid");
    	}
    }
    
}
