package org.egov.utils;

import java.io.IOException;
import java.util.HashMap;

import org.apache.commons.io.IOUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;

@Component
public class ErrorUtils {

	private static final String SEND_ERROR_FILTER_RAN = "sendErrorFilter.ran"; 
	
	private static final ThreadLocal<ObjectMapper> om = new ThreadLocal<ObjectMapper>() {
	    @Override
	    protected ObjectMapper initialValue() {
	        ObjectMapper objectMapper = new ObjectMapper();
	        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
	        return objectMapper;
	    }
	};

	public static ObjectMapper getObjectMapper() {
	    return om.get();
	}
	
    public static String getResponseBody(RequestContext ctx) throws IOException {
        String body = ctx.getResponseBody();

        if (body == null) {
            body = IOUtils.toString(ctx.getResponseDataStream());
            ctx.setResponseBody(body);
        }
        
        return body;
    }
    
	public static void raiseErrorFilterException(RequestContext ctx) {

		Throwable e = ctx.getThrowable() == null ? (Throwable) ctx.get("error.exception") : ctx.getThrowable();

		try {
			if (e == null) {
				if (ctx.getResponseStatusCode() == HttpStatus.NOT_FOUND.value()) {
					_setExceptionBody(HttpStatus.NOT_FOUND, getErrorInfoObject("ResourceNotFoundException",
							"The resource - " + ctx.getRequest().getRequestURI() + " not found", null));
				} else if (ctx.getResponseStatusCode() == HttpStatus.BAD_REQUEST.value()) {
					String existingResponse = getResponseBody(ctx);

					if (existingResponse != null && existingResponse.contains("InvalidAccessTokenException"))
						_setExceptionBody(HttpStatus.UNAUTHORIZED, existingResponse);
				}
				return;
			}

			while ((e instanceof ZuulException || e.getClass().equals(RuntimeException.class)) && e.getCause() != null)
				e = e.getCause();

			String exceptionName = e.getClass().getSimpleName();
			String exceptionMessage = ((Throwable) e).getMessage();

			if (exceptionName.equalsIgnoreCase("HttpHostConnectException")
					|| exceptionName.equalsIgnoreCase("ResourceAccessException")) {
				
				_setExceptionBody(HttpStatus.BAD_GATEWAY, getErrorInfoObject(exceptionName, "The backend service is unreachable", null));
			} else if (exceptionName.equalsIgnoreCase("NullPointerException")) {
				
				_setExceptionBody(HttpStatus.INTERNAL_SERVER_ERROR,
						getErrorInfoObject(exceptionName, exceptionMessage, exceptionMessage));
			} else if (exceptionName.equalsIgnoreCase("HttpClientErrorException")) {
				
				String existingResponse = ((HttpClientErrorException) e).getResponseBodyAsString();
				if (existingResponse.contains("InvalidAccessTokenException"))
					_setExceptionBody(HttpStatus.UNAUTHORIZED, existingResponse);
				else
					_setExceptionBody(((HttpClientErrorException) e).getStatusCode(), existingResponse);
			} else if (exceptionName.equalsIgnoreCase("InvalidAccessTokenException")) {
				
				_setExceptionBody(HttpStatus.UNAUTHORIZED,
						getErrorInfoObject(exceptionName, exceptionMessage, exceptionMessage));
			} else if (exceptionName.equalsIgnoreCase("CustomException")) {
				
				CustomException ce = (CustomException) e;
				_setExceptionBody(HttpStatus.valueOf(ce.nStatusCode),
						getErrorInfoObject(exceptionName, exceptionMessage, exceptionMessage));
			} else {
				
				_setExceptionBody(HttpStatus.INTERNAL_SERVER_ERROR,
						getErrorInfoObject(exceptionName, exceptionMessage, exceptionMessage));
			}
		} catch (Exception e1) {
			e1.printStackTrace();
		}
	}

	private static HashMap<String, Object> getErrorInfoObject(String code, String message, String description) {
	
			HashMap<String, Object> error = new HashMap<String, Object>();
			error.put("code", "INTERNAL_GATEWAY_ERROR");
			error.put("message", code + " : " + message);
			error.put("description", description);
			return error;
	}

	public static void setCustomException(HttpStatus status, String message) {
		try {
			_setExceptionBody(status, getErrorInfoObject("CustomException", message, message));
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}

	private static void _setExceptionBody(HttpStatus status, Object body) throws JsonProcessingException {
		_setExceptionBody(status, getObjectJSONString(body));
	}
	
    private static void _setExceptionBody(HttpStatus status, String body) {
        RequestContext ctx = RequestContext.getCurrentContext();

        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(status.value());
        ctx.getResponse().setContentType("application/json");
        if (body == null)
            body = "{}";
        ctx.setResponseBody(body);
        ctx.remove("error.status_code");
        ctx.set(SEND_ERROR_FILTER_RAN);
        ctx.remove("throwable");
    }

	private static String getObjectJSONString(Object obj) throws JsonProcessingException {
		return  om.get().writeValueAsString(obj);
	}

}
