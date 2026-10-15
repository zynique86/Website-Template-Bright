# 亮点补习中心 · Neo-Brutal 亮色网站模板

补习中心（教育行业）主题的亮色落地页模板，风格为纯色亮块 + 粗黑描边 + 硬阴影。纯 HTML/CSS，零依赖，直接打开 `index.html` 即可预览。

## 包含区块
导航（移动端折叠菜单）· Hero · 跑马灯 · 课程 · 师资 · 收费 · 家长评价 · 常见问题 · 预约试听 · 页脚

## 页面与功能
- `index.html` 首页：每个按钮都能用，课程卡片进入对应科目页，老师卡片进入科目页并自动选好老师，收费按钮带入年级
- `math.html` `english.html` `chinese.html` `science.html` `exam.html` `online.html` 科目页：选年级 → 选老师 → 选日期 → 选时间 → 填资料 → 确认预约
- `teachers.html` 师资页：每位老师的学历、证书与资格、教学成绩，可直接预约该老师的课
- `book.html` 预约试听总入口 + 我的试听与报名记录（可取消）
- `enroll.html` 直接报名总入口；科目页上方可切换「预约免费试听 / 直接报名」
- 报名流程：选年级 → 选老师 → 选每周固定时段（显示剩余名额）→ 选开课日期 → 填学生与家长资料 → 选缴费方式（月付 / 季付 95 折 / 半年 9 折）→ 同意报名须知 → 确认，自动计算应缴金额并生成报名编号
- 已被预约的时段会自动变成不可选；预约成功后可一键 WhatsApp 确认

## 修改内容
- 科目、老师资料与资质、上课时段、价格、报名费、班级人数、缴费方式、报名须知、WhatsApp 号码：全部在 `data.js`
- 预约目前保存在访客浏览器（localStorage），正式上线时把 `course.js` 里的 `saveBookings` / `loadBookings` 换成你的后端或表单服务即可

## 换色
所有颜色都在 `styles.css` 顶部的 `:root` 变量里：

```css
--yellow: #FFE14D;
--pink:   #FF6FB5;
--mint:   #5CF2B5;
--blue:   #6EB8FF;
--orange: #FF9F45;
--cream:  #FFF8E7; /* 页面底色 */
--ink:    #111111; /* 描边与文字 */
```

## 部署
纯静态文件，可直接放到 Vercel、Netlify 或 GitHub Pages。
