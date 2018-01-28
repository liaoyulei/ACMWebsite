安装mongoDB  
在setting.js中修改数据库相关信息  
npm install  
npm start  

---------------------------------------------------------------------------------------------------------  
1.关于session:  
app.js第34行注释掉之后，每次执行ctx.redirect会被清空  
例如：localhost:3000/reg完成注册后，执行index.js的61、62行，跳转到dymatic/index.js第24行，输出session为空  
app.js第34行不注释掉，执行到dymatic/index.js第24行，ctx.session为undefined，也没有user属性  

2.关于文件上传：  
templets/uadmin.ejs第49行，这个表单中同时有文本和文件  
执行到dymatic/index.js第262行时，发现ctx.request.body为空，所有信息都都不出来  
如果这个表单中没有设置enctype="multipart/form-data"就不会出现这个问题  
我设想是将title什么的存入数据库里，picture, attachment就存一个地址在数据库里，同时实现文件上传  
这个地方要如何实现  
