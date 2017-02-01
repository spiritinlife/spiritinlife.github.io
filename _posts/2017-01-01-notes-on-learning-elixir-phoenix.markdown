---
layout: post
title:  "Notes on learning elixir/phoenix"
date:   2017-01-01 19:28:57
categories: Elixir
---


 - 1. In mix.exs where you place your dependencies you can give a custom local path or github link to fetch the lib
{% highlight elixir %}
defp deps do
  [{:phoenix, "~> 1.2.1"},
   {:subdomains,  path: "../../subdomains"}]
end
{% endhighlight %}

 - 2. I can pass things to my templates to render from my controller like this
{% highlight elixir %}
  render conn, "index.html", %{title: "students"}
{% endhighlight %}

 - 3. I can easily have static subdomains with scope's :host option and even forward to a new Router for better separation
{% highlight elixir %}
scope host: "schools." do
 forward "/", Bontime.Schools.Router
end
{% endhighlight %}

 - 4. I can easily have dynamic subdomains if i have a catch all forward to a new router in my base router
 Base router is the one defined in the last line of the lib/projectname/endpoint.ex file where all the basic plugs get executed one after the other
 {% highlight elixir %}
 defmodule Bontime.Router do
   use Bontime.Web, :router

   scope host: "schools." do
    forward "/", Bontime.Schools.Router
   end

   scope host: "students." do
    forward "/", Bontime.Students.Router
   end

   scope host: "api." do
    forward "/", Bontime.Api.Router
   end


   # this catches everything, every subdomain
   forward "/", Bontime.Subdomains.Router
 end
 {% endhighlight %}

 - 5. I can easily create custom plug function just by implementing a functions that accept conn and return conn
  eg for getting the dynamic subdomain
  {% highlight elixir %}
  defp get_subdomain(conn, _) do
   put_private(conn, :subdomain, List.first(String.split(conn.host, "." <> Bontime.Endpoint.config(:url)[:host])))
  end
  {% endhighlight %}
