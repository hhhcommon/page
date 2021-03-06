<!-- TOC -->

- [一、HTTP协议与状态保持](#一http协议与状态保持)
- [二、理解cookie机制](#二理解cookie机制)
- [三、理解session机制](#三理解session机制)
- [四、session过期时间](#四session过期时间)
- [五、Session常见问题](#五session常见问题)
- [六、跨应用程序的session共享](#六跨应用程序的session共享)
- [七、总结](#七总结)

<!-- /TOC -->

>因为曾经年轻不懂事，被面试问起session和cookie的深度问题，所以决定整理一波。

#### 一、HTTP协议与状态保持 ####
HTTP 协议本身是无状态的，这与HTTP协议本来的目的是相符的，客户端只需要简单的向服务器请求下载某些文件，无论是客户端还是服务器都没有必要纪录彼此过去的行为，每一次请求之间都是独立的，好比一个顾客和一个自动售货机或者一个普通的（非会员制）大卖场之间的关系一样。

然而聪明的人们很快发现如果能够提供一些按需生成的动态信息会使web变得更加有用，就像给有线电视加上点播功能一样。这种需求一方面迫使 HTML逐步添加了表单、脚本、DOM等客户端行为，另一方面在服务器端则出现了CGI规范以响应客户端的动态请求，作为传输载体的HTTP协议也添加了文件上载、 cookie这些特性。其中cookie的作用就是为了解决HTTP协议无状态的缺陷所作出的努力。至于后来出现的session机制则是又一种在客户端与服务器之间保持状态的解决方案。

让我们用几个例子来描述一下cookie和session机制之间的区别与联系。**一家咖啡店有喝5杯咖啡免费赠一杯咖啡的优惠，然而一次性消费5杯咖啡的机会微乎其微，这时就需要某种方式来纪录某位顾客的消费数量**。想象一下其实也无外乎下面的几种方案：

**1、**该店的店员很厉害，能记住每位顾客的消费数量，只要顾客一走进咖啡店，店员就知道该怎么对待了。这种做法就是协议本身支持状态。

**2、**发给顾客一张卡片，上面记录着消费的数量，一般还有个有效期限。每次消费时，如果顾客出示这张卡片，则此次消费就会与以前或以后的消费相联系起来。这种做法就是在客户端保持状态。

**3、**发给顾客一张会员卡，除了卡号之外什么信息也不纪录，每次消费时，如果顾客出示该卡片，则店员在店里的纪录本上找到这个卡号对应的纪录添加一些消费信息。这种做法就是在服务器端保持状态。

**由于HTTP协议是无状态的**，而出于种种考虑也不希望使之成为有状态的，因此，后面两种方案就成为现实的选择。具体来说cookie机制采用的是在客户端保持状态的方案，而session机制采用的是在服务器端保持状态的方案。同时我们也看到，由于采用服务器端保持状态的方案在客户端也需要保存一个标识，所以session机制可能需要借助于cookie机制来达到保存标识的目的，但实际上它还有其他选择。

#### 二、理解cookie机制 ####
cookie机制的基本原理就如上面的例子一样简单，但是还有几个问题需要解决：“会员卡”如何分发；“会员卡”的内容；以及客户如何使用“会员卡”。

正统的cookie分发是通过扩展HTTP协议来实现的，服务器通过在HTTP的响应头中加上一行特殊的指示以提示浏览器按照指示生成相应的cookie。然而纯粹的客户端脚本如JavaScript或者VBScript也可以生成cookie。

而cookie 的使用是由浏览器按照一定的原则在后台自动发送给服务器的。浏览器检查所有存储的cookie，如果某个cookie所声明的作用范围大于等于将要请求的资源所在的位置，则把该cookie附在请求资源的HTTP请求头上发送给服务器。

**cookie的内容主要包括：名字，值，过期时间，路径和域。**

其中域可以指定某一个域比如.google.com，也可以指定一个域下的具体某台机器比如www.google.com 或者froogle.google.com。

路径就是跟在域名后面的URL路径，比如/或者/foo等等，
路径与域合在一起就构成了cookie的作用范围。

如果不设置过期时间，则表示这个cookie的生命期为浏览器会话期间，只要关闭浏览器窗口，cookie就消失了。这种生命期为浏览器会话期的 cookie被称为会话cookie。会话cookie一般不存储在硬盘上而是保存在内存里，当然这种行为并不是规范规定的。如果设置了过期时间，浏览器就会把cookie保存到硬盘上，关闭后再次打开浏览器，这些cookie仍然有效直到超过设定的过期时间。

存储在硬盘上的cookie 可以在不同的浏览器进程间共享，比如两个IE窗口。而对于保存在内存里的cookie，不同的浏览器有不同的处理方式。对于IE，在一个打开的窗口上按 Ctrl-N（或者从文件菜单）打开的窗口可以与原窗口共享，而使用其他方式新开的IE进程则不能共享已经打开的窗口的内存cookie；对于 Mozilla Firefox0.8，所有的进程和标签页都可以共享同样的cookie。一般来说是用javascript的window.open打开的窗口会与原窗口共享内存cookie。浏览器对于会话cookie的这种只认cookie不认人的处理方式经常给采用session机制的web应用程序开发者造成很大的困扰。

下面就是一个goolge设置cookie的响应头的例子

    HTTP/1.1 302 Found
    
    Location: http://www.google.com/intl/zh-CN/
    
    Set-Cookie: PREF=ID=0565f77e132de138:NW=1:TM=1098082649:LM=1098082649:
    
    S=KaeaCFPo49RiA_d8; expires=Sun, 17-Jan-2038 19:14:07 GMT; path=/; domain=.google.com
    
    Content-Type: text/html

#### 三、理解session机制 ####
HTTP协议（http://www.w3.org/Protocols/）是“一次性单向”协议。

服务端不能主动连接客户端，只能被动等待并答复客户端请求。客户端连接服务端，发出一个HTTP Request，服务端处理请求，并且返回一个HTTP Response给客户端，本次HTTP Request-Response Cycle结束。

我们看到，HTTP协议本身并不能支持服务端保存客户端的状态信息。于是，Web Server中引入了session的概念，用来保存客户端的状态信息。

session机制是一种服务器端的机制，服务器使用一种类似于散列表的结构（也可能就是使用散列表）来保存信息。

当程序需要为某个客户端的请求创建一个session的时候，服务器首先检查这个客户端的请求里是否已包含了一个session标识 - 称为 session id，**如果已包含一个session id**则说明以前已经为此客户端创建过session，服务器就按照session id把这个 session检索出来使用（如果检索不到，可能会新建一个），**如果客户端请求不包含session id**，则为此客户端创建一个session并且生成一个与此session相关联的session id，session id的值应该是一个既不会重复，又不容易被找到规律以仿造的字符串，这个 session id将被在本次响应中返回给客户端保存。

#### 四、session过期时间 ####

在谈论session机制的时候，常常听到这样一种误解“只要关闭浏览器，session就消失了”。其实可以想象一下会员卡的例子，除非顾客主动对店家提出销卡，否则店家绝对不会轻易删除顾客的资料。对session来说也是一样的，除非程序通知服务器删除一个session，否则服务器会一直保留，程序一般都是在用户做log off的时候发个指令去删除session。然而浏览器从来不会主动在关闭之前通知服务器它将要关闭，因此服务器根本不会有机会知道浏览器已经关闭，之所以会有这种错觉，是大部分session机制都使用会话cookie来保存session id，而关闭浏览器后这个 session id就消失了，再次连接服务器时也就无法找到原来的session。如果服务器设置的cookie被保存到硬盘上，或者使用某种手段改写浏览器发出的 HTTP请求头，把原来的session id发送给服务器，则再次打开浏览器仍然能够找到原来的session。

恰恰是由于关闭浏览器不会导致session被删除，迫使服务器为seesion设置了一个失效时间，当距离客户端上一次使用session的时间超过这个失效时间时，服务器就可以认为客户端已经停止了活动，才会把session删除以节省存储空间。



#### 五、Session常见问题 ####

**1、session在何时被创建**

一个常见的误解是以为session在有客户端访问时就被创建，然而事实是直到某server端程序调用 开启session_start()这样的语句时才被创建，由于session会消耗内存资源，因此，如果不打算使用session。在php.ini中可以配置是否默认开启session机制。

**2、session何时被删除**

综合前面的讨论，session在下列情况下被删除

- 程序主动unset($_SESSION['name'])
- 距离上一次收到客户端发送的session id时间间隔超过了session的超时设置
- 服务器进程被停止（非持久session）

**3、如何做到在浏览器关闭时删除session**

严格的讲，做不到这一点。可以做一点努力的办法是在所有的客户端页面里使用javascript代码window.oncolose来监视浏览器的关闭动作，然后向服务器发送一个请求来删除session。但是对于浏览器崩溃或者强行杀死进程这些非常规手段仍然无能为力。

**4、有个HttpSessionListener是怎么回事**

你可以创建这样的listener去监控session的创建和销毁事件，使得在发生这样的事件时你可以做一些相应的工作。注意是session的创建和销毁动作触发listener，而不是相反。类似的与

**5、存放在session中的对象必须是可序列化的吗**

不是必需的。要求对象可序列化只是为了session能够在集群中被复制或者能够持久保存或者在必要时server能够暂时把session交换出内存。

**6、如何才能正确的应付客户端禁止cookie的可能性**

对所有的URL使用URL重写，包括超链接，form的action，和重定向的URL。

**7、开两个浏览器窗口访问应用程序会使用同一个session还是不同的session**

参见第二小节对cookie的讨论，对session来说是只认id不认人，因此不同的浏览器，不同的窗口打开方式以及不同的cookie存储方式都会对这个问题的答案有影响。

**8、如何防止用户打开两个浏览器窗口操作导致的session混乱**

这个问题与防止表单多次提交是类似的，可以通过设置客户端的令牌token来解决。就是在服务器每次生成一个不同的id返回给客户端，同时保存在session里，客户端提交表单时必须把这个id也返回服务器，程序首先比较返回的id与保存在session里的值是否一致，如果不一致则说明本次操作已经被提交过了。需要注意的是对于使用javascript window.open打开的窗口，一般不设置这个id，或者使用单独的id，以防主窗口无法操作，建议不要再window.open打开的窗口里做修改操作，这样就可以不用设置。


#### 六、跨应用程序的session共享 ####

常常有这样的情况，一个大项目被分割成若干小项目开发，为了能够互不干扰，要求每个小项目作为一个单独的web应用程序开发，可是到了最后突然发现某几个小项目之间需要共享一些信息，或者想使用session来实现SSO(single sign on)，在session中保存login的用户信息，最自然的要求是应用程序间能够访问彼此的session。


#### 七、总结 ####
session机制本身并不复杂，然而其实现和配置上的灵活性却使得具体情况复杂多变。这也要求我们不能把仅仅某一次的经验或者某一个浏览器，服务器的经验当作普遍适用的经验，而是始终需要具体情况具体分析。

----
@tsingchan

