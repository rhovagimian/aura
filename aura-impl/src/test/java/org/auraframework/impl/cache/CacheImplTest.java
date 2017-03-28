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
package org.auraframework.impl.cache;

import org.auraframework.cache.Cache;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.ArgumentMatcher;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Set;

public class CacheImplTest extends UnitTestCase {

    private <K, T> com.google.common.cache.Cache<K, T> getMockCache() {
        com.google.common.cache.Cache<K, T> cache = com.google.common.cache.CacheBuilder
                .newBuilder().build();
        return Mockito.spy(cache);
    }

    private class CollectionContainsAllMatcher<T> extends ArgumentMatcher<T> {
        private Collection<T> expected;

        CollectionContainsAllMatcher(@SuppressWarnings("unchecked") T... expected) {
            this.expected = Arrays.asList(expected);
        }

        @SuppressWarnings("unchecked")
        @Override
        public boolean matches(Object argument) {
            Collection<T> actual = (Collection<T>) argument;
            return expected.containsAll(actual) && actual.containsAll(expected);
        }
    }

    @Test
    public void testGetIfPresent() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        Object key = new Object();
        Object expected = new Object();
        Mockito.doReturn(expected).when(backingCache).getIfPresent(key);

        Object actual = cache.getIfPresent(key);
        assertEquals(expected, actual);
    }

    @Test
    public void testPut() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        Object key = new Object();
        Object data = new Object();

        cache.put(key, data);
        Mockito.verify(backingCache, Mockito.times(1)).put(key, data);
    }

    @Test
    public void testInvalidateKey() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        Object key = new Object();

        cache.invalidate(key);
        Mockito.verify(backingCache, Mockito.times(1)).invalidate(key);
    }

    @Test
    public void testInvalidateKeys() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        Iterable<Object> keys = new ArrayList<>();

        cache.invalidate(keys);
        Mockito.verify(backingCache, Mockito.times(1)).invalidateAll(keys);
    }

    @Test
    public void testInvalidateAll() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);

        cache.invalidateAll();
        Mockito.verify(backingCache, Mockito.times(1)).invalidateAll();
    }

    @Test
    public void testGetKeySet() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);

        Set<Object> actualKeySet = cache.getKeySet();
        assertEquals(backingCache.asMap().keySet(), actualKeySet);
    }

    @Test
    public void testInvalidatePartial_NullInput() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        cache.invalidatePartial(null);
        Mockito.verify(backingCache, Mockito.times(1)).invalidateAll();
    }

    @Test
    public void testInvalidatePartial_EmptyString() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        cache.invalidatePartial("");
        Mockito.verify(backingCache, Mockito.times(1)).invalidateAll();
    }

    @Test
    public void testInvalidatePartial_WhitespaceString() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        backingCache.put("someKey", "someValue");
        cache.invalidatePartial(" ");
        Mockito.verify(backingCache, Mockito.never()).invalidate(
                Mockito.anyCollection());
    }

    @Test
    public void testInvalidatePartial_SingleMatch() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        backingCache.put("someKey", "someValue");
        cache.invalidatePartial("someKey");
        Mockito.verify(backingCache, Mockito.times(1)).invalidate(
                Mockito.argThat(new CollectionContainsAllMatcher<Object>("someKey")));
    }

    @Test
    public void testInvalidatePartial_MultipleMatches() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        backingCache.put("someKey", "someValue");
        backingCache.put("someOtherKey", "someValue");
        backingCache.put("unmatchedKey", "someValue");
        backingCache.put("someThing", "someValue");

        cache.invalidatePartial("some");
        Mockito.verify(backingCache, Mockito.times(1)).invalidate(
                Mockito.argThat(new CollectionContainsAllMatcher<Object>("someKey",
                        "someOtherKey", "someThing")));
    }

    @Test
    public void testInvalidatePartial_NoMatch() {
        com.google.common.cache.Cache<Object, Object> backingCache = getMockCache();
        Cache<Object, Object> cache = new CacheImpl<>(
                backingCache);
        backingCache.put("someKey", "someValue");
        cache.invalidatePartial("otherKey");
        Mockito.verify(backingCache, Mockito.never()).invalidate(
                Mockito.anyCollection());
    }
}
