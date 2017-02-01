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
