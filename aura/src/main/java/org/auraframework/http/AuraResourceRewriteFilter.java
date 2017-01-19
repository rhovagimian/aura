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
package org.auraframework.http;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.util.AuraTextUtil;

/**
 */
public class AuraResourceRewriteFilter implements Filter {

    public static final String FORMAT_PARAM = "aura.format";
    public static final String CONTEXT_PARAM = "aura.context";
    public static final String TYPE_PARAM = "aura.type";
    public static final String LOOKUP_PARAM = "aura.lookup";

    private ServletContext servletContext;

    private static final String uriPattern = "/auraResource?%s=%s&%s=%s&%s=%s";
    private static final String lookupPattern = "&%s=%s";

    private static final Pattern pattern = Pattern.compile("^/l/([^/]*)/(?:([^/]*)/)?(.*?)[.]([^.]*)$");

    @Override
    public void destroy() {
    }

    private static String createURI(String context, String format, String type, String lookup) {
        StringBuilder sb = new StringBuilder(String.format(uriPattern,
                FORMAT_PARAM, format,
                CONTEXT_PARAM, AuraTextUtil.urldecode(context),
                TYPE_PARAM, type));

        if (lookup != null && !lookup.isEmpty()) {
            sb.append(String.format(lookupPattern, LOOKUP_PARAM, lookup));
        }

        return sb.toString();
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {

        HttpServletRequest request = (HttpServletRequest) req;

        String path = request.getRequestURI().substring(request.getContextPath().length());

        String newUri = null;
        Matcher matcher = pattern.matcher(path);
        if (matcher.matches()) {
            newUri = createURI(matcher.group(1), matcher.group(4), matcher.group(3), matcher.group(2));
            // Sometimes original request URI can be useful: Eg: manifast in
            // AuraResourceServlet
            request.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI,
                    (request.getQueryString() != null) ? request.getRequestURI() + "?" + request.getQueryString()
                            : request.getRequestURI());
        }

        if (newUri != null) {
            RequestDispatcher dispatcher = servletContext.getRequestDispatcher(newUri);

            if (dispatcher != null) {
                dispatcher.forward(req, res);
                return;
            }
        }

        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
        servletContext = config.getServletContext();
    }
}
