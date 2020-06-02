package org.egov.common.client;

import lombok.*;
import org.egov.common.config.*;
import org.egov.common.contract.request.*;
import org.egov.common.contract.response.*;
import org.egov.common.exceptions.*;

import java.net.*;
import java.util.*;

public class LocalizationService {
    private static final String localizationHost;
    private static final String localizationContext;

    static {
        localizationHost = HostConfigs.getLocalizationHost();
        localizationContext = HostConfigs.getLocalizationContext();
    }

    @SneakyThrows
    public static URI getUrl(String url) {
        return HttpService.resolveUrl(localizationHost, localizationContext, url);
    }

    public static MessagesResponse getMessagesForLocale(MessageSearchQueryParam queryParams) throws HttpClientException {
        return HttpService.getInstance().get(getUrl("/messages/v1/_search"), queryParams);
    }

    public static MessagesResponse searchMessages(MessageSearchQueryParam queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/messages/v1/_search"), null, queryParams);
    }

    public static MessagesResponse createMessages(CreateMessagesRequest messagesRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/messages/v1/_create"), messagesRequest, queryParams);
    }

    public static MessagesResponse upsertMessages(CreateMessagesRequest messagesRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/messages/v1/_upsert"), messagesRequest, queryParams);
    }

    public static CacheBustResponse cacheBust() throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/cache-bust"), null , null);
    }

    public static  MessagesResponse updateMessages(UpdateMessageRequest messageRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/messages/v1/_update"), messageRequest, queryParams);
    }

    public static DeleteMessagesResponse deleteMessages(DeleteMessagesRequest deleteMessagesRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/messages/v1/_delete"), deleteMessagesRequest, queryParams);
    }

}
