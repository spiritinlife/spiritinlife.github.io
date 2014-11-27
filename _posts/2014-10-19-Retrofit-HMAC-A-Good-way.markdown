---
layout: post
title:  "Retrofit and HMAC now possible"
date:   2014-11-27 8:15:57
categories: Android
---


It has been a long since my last post , but i am back and i think with something good :) <br>

<h2>This post is about Android , Retrofit , HMAC.</h2> <br>

Two problems solved<br>
1) Retrofit does not support HMAC , out of the box <br>
2) HMAC , there is no quick implementation out there . ( well now there is :) )<br>


Lets start with HMAC<br>

I have created a class with two static methods that generate a cheksum based on a key , an algorithm and a bytearray or a string as value.
The algorithm looks like a common java implementation but there is a catch .

{% highlight java %}
import android.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class HMAC {

    public static String hmacDigest(String msg, String keyString, String algo) {
        String digest = null;
        try {
            SecretKeySpec key = new SecretKeySpec(keyString.getBytes("UTF-8"), algo);
            Mac mac = Mac.getInstance(algo);
            mac.init(key);

            // Base64.NO_WRAP   Encoder flag bit to omit all line terminators (i.e., the output will be on one long line). 
            // If we do not use Base64.NO_WRAP the string will not be correct
            digest = Base64.encodeToString(mac.doFinal(msg.getBytes("UTF-8")), Base64.NO_WRAP); 

        } catch (UnsupportedEncodingException e) {
        } catch (InvalidKeyException e) {
        } catch (NoSuchAlgorithmException e) {
        }
        return digest;
    }

    public static String hmacDigest(byte[] msg, String keyString, String algo) {
        String digest = "";
        try {
            SecretKeySpec key = new SecretKeySpec(keyString.getBytes("UTF-8"), algo);
            Mac mac = Mac.getInstance(algo);
            mac.init(key);

            // Base64.NO_WRAP   Encoder flag bit to omit all line terminators (i.e., the output will be on one long line). 
            // If we do not use Base64.NO_WRAP the string will not be correct
            digest = Base64.encodeToString(sha256_HMAC.doFinal(msg), Base64.NO_WRAP); 

        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        return digest;
    }
}
{% endhighlight %}

<br>
So if you go through the code you will see this 
// Base64.NO_WRAP   Encoder flag bit to omit all line terminators (i.e., the output will be on one long line).<br> 
// If we do not use Base64.NO_WRAP the string will not be correct<br>
digest = Base64.encodeToString(mac.doFinal(msg.getBytes("UTF-8")), Base64.NO_WRAP); <br>

The comment is self explanatory but i think it will save people's time.


So now that we know how to generate checksum lets connect with retrofit.<br>

Well there is no easy way because in no point in the retrofit's "lifecycle" you get access to the body.<br>
So what i did ?<br>
I found out from a github post about this problem a way https://github.com/square/retrofit/issues/429 .Unfortunetly they do not give any code , so for me the problem was not solved yet , for you.. well you are lucky you ended up here.<br>

In retrofit when you build ur adapter you can set your own client<br>.
As i understand clients configure the message that u send .<br>
If you look through the retrofit code you will find out that they use by default ( i think ) a class which is named ApacheClient that extends the Class client.<br>

So what i did was to create a class name SigningClient that extends the class Client just like ApacheClient and copy/paste the code from ApacheClient to my own.<br>

Now i had to find where i can get my hands on the body and create the appropriate headers.<br>
After some reverse-engineering i succeeded :) <br>


So i will show u the whole class and after that i will explain what i changed and how to connect this class with retrofit.

{% highlight java %}


import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.AbstractHttpEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;

import retrofit.client.Client;
import retrofit.client.Header;
import retrofit.client.Request;
import retrofit.client.Response;
import retrofit.mime.TypedByteArray;
import retrofit.mime.TypedOutput;


public class SigningClient implements Client {
    private static HttpClient createDefaultClient() {
        HttpParams params = new BasicHttpParams();
        HttpConnectionParams.setConnectionTimeout(params, Defaults.CONNECT_TIMEOUT_MILLIS);
        HttpConnectionParams.setSoTimeout(params, Defaults.READ_TIMEOUT_MILLIS);
        return new DefaultHttpClient(params);
    }

    private final HttpClient client;

    public SigningClient() {
        this(createDefaultClient());
    }

    public SigningClient(HttpClient client) {
        this.client = client;
    }

    @Override public Response execute(Request request) throws IOException {
        HttpUriRequest apacheRequest = createRequest(request);
        HttpResponse apacheResponse = execute(client, apacheRequest);
        return parseResponse(request.getUrl(), apacheResponse);
    }

    /** Execute the specified {@code request} using the provided {@code client}. */
    protected HttpResponse execute(HttpClient client, HttpUriRequest request) throws IOException {
        return client.execute(request);
    }

    static HttpUriRequest createRequest(Request request) {
        if (request.getBody() != null) {
            //post with body
            return new GenericEntityHttpRequest(request);
        }
        //get or other method without body
        return new GenericHttpRequest(request);
    }

    static Response parseResponse(String url, HttpResponse response) throws IOException {
        StatusLine statusLine = response.getStatusLine();
        int status = statusLine.getStatusCode();
        String reason = statusLine.getReasonPhrase();

        List<Header> headers = new ArrayList<Header>();
        String contentType = "application/octet-stream";
        for (org.apache.http.Header header : response.getAllHeaders()) {
            String name = header.getName();
            String value = header.getValue();
            if ("Content-Type".equalsIgnoreCase(name)) {
                contentType = value;
            }
            headers.add(new Header(name, value));
        }

        TypedByteArray body = null;
        HttpEntity entity = response.getEntity();
        if (entity != null) {
            byte[] bytes = EntityUtils.toByteArray(entity);
            body = new TypedByteArray(contentType, bytes);
        }

        return new Response(url, status, reason, headers, body);
    }

    private static class GenericHttpRequest extends HttpRequestBase {
        private final String method;

        public GenericHttpRequest(Request request) {
            method = request.getMethod();
            setURI(URI.create(request.getUrl()));

            // Add all headers.
            for (Header header : request.getHeaders()) {
                addHeader(new BasicHeader(header.getName(), header.getValue()));
            }

        }

        @Override public String getMethod() {
            return method;
        }
    }

    private static class GenericEntityHttpRequest extends HttpEntityEnclosingRequestBase {
        private final String method;

        GenericEntityHttpRequest(Request request) {
            super();
            method = request.getMethod();
            setURI(URI.create(request.getUrl()));

            // Add all headers.
            for (Header header : request.getHeaders()) {
               addHeader(new BasicHeader(header.getName(), header.getValue()));
            }

            TypedOutputEntity bodyContent = new TypedOutputEntity(request.getBody());
            // Add the content body.
            setEntity(bodyContent);


            byte[] bodyBytes;
            String checksum = "";
            InputStream is = null;
            //first we read the body and convert it into bytearray
            try {
                is = bodyContent.getContent();
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();

                int nRead;
                byte[] data = new byte[16384];

                while ((nRead = is.read(data, 0, data.length)) != -1) {
                    buffer.write(data, 0, nRead);
                }

                buffer.flush();
                bodyBytes = buffer.toByteArray();

                // after we have our bytearray we can generate the cheksum
                checksum = HMAC.hmacDigest(bodyBytes,Defaults.PRIVATE_KEY,"HmacSHA256");
            } catch (IOException e) {
                e.printStackTrace();
            }


            //here we create the cheksum header
            // Note even though we add it and it is confirmed we do it does not show up in the default retrofit debugging
            BasicHeader header = new BasicHeader("x-api-secret",""+checksum);
            addHeader(header);
        }

        @Override public String getMethod() {
            return method;
        }
    }


    /** Container class for passing an entire {@link TypedOutput} as an {@link HttpEntity}. */
    static class TypedOutputEntity extends AbstractHttpEntity {
        final TypedOutput typedOutput;
        ByteArrayOutputStream out;

        TypedOutputEntity(TypedOutput typedOutput) {
            this.typedOutput = typedOutput;
            setContentType(typedOutput.mimeType());
        }


        @Override public boolean isRepeatable() {
            return true;
        }

        @Override public long getContentLength() {
            return typedOutput.length();
        }

        @Override public InputStream getContent() throws IOException {
            out = new ByteArrayOutputStream();
            typedOutput.writeTo(out);
            return new ByteArrayInputStream(out.toByteArray());
        }

        @Override public void writeTo(OutputStream out) throws IOException {
            typedOutput.writeTo(out);
        }

        @Override public boolean isStreaming() {
            return false;
        }
    }
}
{% endhighlight %}



So i hope you are still with me <br>

There are two things to notice <br>
First in the snippet below how  the client handles messages with body and message without.<br>

{% highlight java %}
static HttpUriRequest createRequest(Request request) {
    if (request.getBody() != null) {
        //post with body
        return new GenericEntityHttpRequest(request);
    }
    //get or other method without body
    return new GenericHttpRequest(request);
}
{% endhighlight %}


<br>
So we call create a class called GenericEntityHttpRequest<br>
If you check this class (or snippet below) you will find my code that generates the checksum and ads the header x-api-secret
<br>
{% highlight java %}

byte[] bodyBytes;
String checksum = "";
InputStream is = null;
//first we read the body and convert it into bytearray
try {
    is = bodyContent.getContent();
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();

    int nRead;
    byte[] data = new byte[16384];

    while ((nRead = is.read(data, 0, data.length)) != -1) {
        buffer.write(data, 0, nRead);
    }

    buffer.flush();
    bodyBytes = buffer.toByteArray();

    // after we have our bytearray we can generate the cheksum
    checksum = HMAC.hmacDigest(bodyBytes,Defaults.PRIVATE_KEY,"HmacSHA256");
} catch (IOException e) {
    e.printStackTrace();
}


//here we create the cheksum header
// Note even though we add it and it is confirmed we do it does not show up in the default retrofit debugging
BasicHeader header = new BasicHeader("x-api-secret",""+checksum);
addHeader(header);

{% endhighlight %}

<br>
Ok so now all we have to do is tell retrofit to use this client for its operations<br>
And that is very easy <br>
All you have to do is say <br>

{% highlight java %}
adapter = new RestAdapter.Builder()
        .setClient(new SigningClient())    // <--  this where you say retrofit to use our class 
        .setEndpoint(SERVER)
        .build();
{% endhighlight %}


That is all to it folks, hope i helped anyone out there <br>
Comment if you have any suggestions or questions or you want to say something else :) <br>


-Keep on coding<br>
-Spiritinlife<br>
















