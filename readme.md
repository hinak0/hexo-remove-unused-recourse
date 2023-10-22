# hexo-remove-unused-recourse

去除hexo项目中不再被引用的资源，无任何依赖

## 使用方法
1. `npm i hexo-remove-unused-recourse -g`安装
2. 首先在hexo根目录运行`hexo-remove-unused-recourse`，会生成待删除列表`unusedRecs.list`在根目录。
3. 对这个列表进行自定义修改
4. 再次运行`hexo-remove-unused-recourse`，回车确认，执行删除。

## 工作流程
1. 读取主目录中的hexo配置，获取source和recourse文件

	官方文档上这么描述：
	> 资源文件夹是存放用户资源的地方。除 _posts 文件夹之外，开头命名为 _ (下划线)的文件 / 文件夹和隐藏的文件将会被忽略。Markdown 和 HTML 文件会被解析并放到 public 文件夹，而其他文件会被拷贝过去。

2. 递归遍历相关文件夹，获取`所有资源路径列表`
3. 正则搜索所有markdown文件，获取`所有被引用的文件路径列表`
4. 上面两个列表相减，获得`不被引用的文件路径列表`
5. 将上面一步获取的列表保存在`unusedRecs.list`,用户可以进行各种修改。
6. 对不引用的文件列表进行一个删除
