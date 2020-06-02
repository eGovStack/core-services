package org.egov.common.client;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.core.type.*;
import com.fasterxml.jackson.databind.*;
import lombok.*;
import org.apache.http.*;
import org.apache.http.client.methods.*;
import org.apache.http.client.utils.*;
import org.apache.http.conn.*;
import org.apache.http.entity.*;
import org.apache.http.impl.client.*;
import org.apache.http.impl.conn.*;
import org.apache.http.message.*;
import org.apache.commons.io.IOUtils;
import org.egov.common.exceptions.*;


import java.io.*;
import java.net.*;
import java.util.*;

class HttpService {
    HttpClientConnectionManager poolingConnManager
            = new PoolingHttpClientConnectionManager();
    private static HttpService instance;
    private static ObjectMapper mapper;

    public static HttpService getInstance() {
        if (instance == null) {
            //synchronized block to remove overhead
            synchronized (HttpService.class) {
                if (instance == null) {
                    // if instance is null, initialize
                    mapper = new ObjectMapper();
                    mapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
                    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                    mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

                    instance = new HttpService();
                }

            }
        }
        return instance;
    }

    public static URI resolveUrl(String host, String context, String url) throws URISyntaxException {
        return  new URI(host).resolve(context).resolve(url);
    }

    @SneakyThrows
    public <QueryParam> List<NameValuePair> convertToNameValuePair(QueryParam qp) {
        if (qp == null) {
            return new ArrayList<>();
        }

        TypeReference<HashMap<String, String>> typeRef
                = new TypeReference<HashMap<String, String>>() {
        };

        HashMap<String, String> pairs = mapper.readValue(mapper.writeValueAsString(qp), typeRef);
        List<NameValuePair> nvpList = new ArrayList<>(pairs.size());

        for (Map.Entry<String, String> entry : pairs.entrySet()) {
            nvpList.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
        }

        return nvpList;
    }

    public <Res, QueryParam> Res get(URI url, QueryParam qp) throws HttpClientException {
        URI uri = getUriWithQueryParams(url, qp);

        HttpGet httpGet = new HttpGet(uri);

        return getUrlResponse(httpGet);
    }

    private <QueryParam> URI getUriWithQueryParams(URI url, QueryParam qp) {
        URI uri = null;
        try {
            uri = new URIBuilder(url)
                    .setParameters(convertToNameValuePair(qp))
                    .build();
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        return uri;
    }

    public <Req, Res, QueryParam> Res post(URI url, Req body, QueryParam qp) throws HttpClientException {
        URI uri = getUriWithQueryParams(url, qp);
        HttpPost post = new HttpPost(uri);

        try {
            post.setEntity(new StringEntity(mapper.writeValueAsString(body)));
        } catch (UnsupportedEncodingException | JsonProcessingException e) {
            throw new HttpClientException(e);
        }

        return getUrlResponse(post);
    }

    private <Res> Res getUrlResponse(HttpRequestBase post) throws HttpClientException {
        CloseableHttpClient client
                = HttpClients.custom().setConnectionManager(poolingConnManager)
                .build();

        CloseableHttpResponse res = null;
        try {
            res = client.execute(post);
        } catch (IOException e) {
            throw new HttpClientException(e);
        }
        return getResponse(res);
    }

    private <Res> Res getResponse(CloseableHttpResponse res) throws HttpClientException {
        String json = null;

        if (!(res.getStatusLine().getStatusCode() >= 200 && res.getStatusLine().getStatusCode() < 200)) {
            throw new HttpClientException(res);
        }

        try {
            json = IOUtils.toString(res.getEntity().getContent(), "UTF-8");
        } catch (IOException e) {
            throw new HttpClientException(e);
        }

        TypeReference<Res> typeRefResponse
                = new TypeReference<Res>() {
        };

        try {
            return mapper.readValue(json, typeRefResponse);
        } catch (IOException e) {
            throw new HttpClientException(e);
        }
    }

}
