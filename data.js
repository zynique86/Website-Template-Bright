/* ==========================================================
   科目、老师、上课时段数据
   改课程内容、增减老师、调整时段，都只需要改这个文件。
   - teachers：每位老师的资料与资质（学历、证书、教学成绩）
   - subjects[].teachers：该科目由哪些老师教，以及各自的上课时段
   slots 的键是星期几：1=周一 … 6=周六，0=周日
   ========================================================== */
window.SITE = {
  name: "亮点补习中心",
  currency: "$",
  whatsapp: "60123456789", // 换成你的 WhatsApp 号码（国家码 + 号码，不要加号）
  levels: {
    primary:   { name: "小学", price: 120, unit: "/科/月", grades: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"] },
    secondary: { name: "中学", price: 160, unit: "/科/月", grades: ["中一", "中二", "中三", "中四", "中五"] }
  },

  // 直接报名的设定
  enroll: {
    registrationFee: 50, // 首次报名的一次性报名费
    classSize: 8,        // 每班人数上限
    plans: [             // 缴费方式（冲刺班按期收费，不适用）
      { id: "month",   name: "按月缴费",       months: 1, discount: 0 },
      { id: "quarter", name: "按季缴费 · 95 折", months: 3, discount: 0.05 },
      { id: "half",    name: "半年缴费 · 9 折",  months: 6, discount: 0.10 }
    ],
    terms: "报名后首月学费不设退款；请假可安排补课；学费需于每期开课前缴付。"
  },

  teachers: {
    lin: {
      name: "林老师", emoji: "👩‍🏫", color: "bg-orange", years: 12, title: "数学科主任",
      bio: "擅长把抽象概念讲得简单易懂，带过 30 届考生，熟悉各科出题趋势。",
      education: ["数学教育硕士", "应用数学学士（荣誉学位）"],
      certs: ["注册合格教师", "奥林匹克数学教练认证"],
      achievements: ["近三届学生数学 A 率 92%", "指导学生获全国数学竞赛金奖"]
    },
    goh: {
      name: "吴老师", emoji: "🧑‍🏫", color: "bg-yellow", years: 6, title: "中学数学老师",
      bio: "前中学数学科主任，专攻中学代数与几何。",
      education: ["数学学士（荣誉学位）", "教育文凭"],
      certs: ["注册合格教师"],
      achievements: ["曾任国民中学数学科主任 3 年", "编写校本代数练习册"]
    },
    tan: {
      name: "Mr. Tan", emoji: "👨‍🏫", color: "bg-blue", years: 8, title: "英文科主任",
      bio: "课堂轻松有趣，学生都敢开口；也是英文冲刺班主讲。",
      education: ["英语文学学士", "英语教学研究生文凭"],
      certs: ["CELTA 英语教学证书", "IELTS 8.5"],
      achievements: ["冲刺班学生英文平均进步 2 个等级", "校际英语辩论赛评审"]
    },
    lee: {
      name: "Ms. Lee", emoji: "👩‍💼", color: "bg-pink", years: 5, title: "英文 / 线上课程老师",
      bio: "擅长作文批改与考试技巧，线上课堂互动性强。",
      education: ["英语教育学士"],
      certs: ["TESOL 认证", "Google 认证教育者 Level 2"],
      achievements: ["线上班续报率 95%", "学生作文获州级比赛一等奖"]
    },
    huang: {
      name: "黄老师", emoji: "👩‍🏫", color: "bg-yellow", years: 15, title: "华文科主任",
      bio: "资深华文老师，作文辅导经验丰富。",
      education: ["中文系硕士", "中文系学士"],
      certs: ["注册合格教师", "汉语水平考试（HSK）考官"],
      achievements: ["15 年来指导 1,000+ 位学生", "出版《小学华文作文 50 篇》"]
    },
    zhou: {
      name: "周老师", emoji: "🧑‍🎓", color: "bg-mint", years: 4, title: "华文 / 线上课程老师",
      bio: "用故事和游戏带低年级孩子识字，也擅长线上白板教学。",
      education: ["中文系学士"],
      certs: ["幼儿与小学语文教学证书"],
      achievements: ["设计「识字闯关」游戏课程", "学生识字量平均提升 40%"]
    },
    chen: {
      name: "陈老师", emoji: "🧑‍🔬", color: "bg-mint", years: 10, title: "科学科主任",
      bio: "化学系出身，实验课是孩子们的最爱。",
      education: ["化学硕士", "化学学士（荣誉学位）"],
      certs: ["注册合格教师", "实验室安全培训认证"],
      achievements: ["近三届学生科学 A 率 89%", "带队获全国青少年科学展银奖"]
    },
    wong: {
      name: "黄 Sir", emoji: "👨‍🔬", color: "bg-blue", years: 7, title: "中学理科老师",
      bio: "物理与生物双专长，擅长中学理科。",
      education: ["物理学士", "生物科学辅修"],
      certs: ["注册合格教师"],
      achievements: ["中学理科班学生平均进步 1.5 个等级", "STEM 工作坊讲师"]
    }
  },

  subjects: [
    {
      id: "math", page: "math.html", name: "数学", icon: "➗", color: "bg-yellow",
      tagline: "从基础运算到解题思路，一步步拆解，让孩子不再怕应用题。",
      highlights: ["每堂课先复习后新课", "应用题拆解四步法", "每周练习卷 + 批改", "每月小测追踪进度"],
      levels: ["primary", "secondary"],
      teachers: [
        { id: "lin", slots: { 1: ["16:00", "18:00"], 3: ["16:00", "18:00"], 6: ["09:00", "11:00", "14:00"] } },
        { id: "goh", slots: { 2: ["17:00", "19:30"], 4: ["17:00", "19:30"], 0: ["10:00"] } }
      ]
    },
    {
      id: "english", page: "english.html", name: "英文", icon: "🔤", color: "bg-pink",
      tagline: "阅读、写作、口语三管齐下，敢开口，也写得好。",
      highlights: ["分级阅读计划", "作文结构模板", "每堂 15 分钟口语练习", "语法错题本"],
      levels: ["primary", "secondary"],
      teachers: [
        { id: "tan", slots: { 1: ["17:00", "19:00"], 4: ["17:00", "19:00"], 6: ["10:00", "13:00"] } },
        { id: "lee", slots: { 2: ["16:00", "18:00"], 5: ["16:00", "18:00"], 0: ["14:00"] } }
      ]
    },
    {
      id: "chinese", page: "chinese.html", name: "华文", icon: "📖", color: "bg-mint",
      tagline: "识字、作文、阅读理解，用故事和游戏打好语文基础。",
      highlights: ["趣味识字游戏", "看图作文训练", "阅读理解答题技巧", "成语与好词好句积累"],
      levels: ["primary", "secondary"],
      teachers: [
        { id: "huang", slots: { 2: ["16:00", "18:00"], 4: ["16:00", "18:00"], 6: ["09:30", "11:30"] } },
        { id: "zhou",  slots: { 1: ["15:30", "17:30"], 3: ["15:30"], 0: ["10:00", "13:00"] } }
      ]
    },
    {
      id: "science", page: "science.html", name: "科学", icon: "🔬", color: "bg-blue",
      tagline: "动手做实验，把课本里的概念变成看得见的现象。",
      highlights: ["每月一次动手实验", "概念图整理笔记", "实验题答题框架", "生活中的科学小专题"],
      levels: ["primary", "secondary"],
      teachers: [
        { id: "chen", slots: { 3: ["16:00", "18:00"], 5: ["17:00", "19:00"], 6: ["14:00", "16:00"] } },
        { id: "wong", slots: { 1: ["18:00"], 2: ["18:00", "20:00"], 0: ["11:00"] } }
      ]
    },
    {
      id: "exam", page: "exam.html", name: "考试冲刺班", icon: "🎯", color: "bg-orange",
      tagline: "针对大考的重点题型和时间管理，考前集中强化。",
      highlights: ["考前 6 周密集课程", "历年考题精讲", "全真模拟考", "个别检讨与弱项补强"],
      levels: ["primary", "secondary"],
      price: 380, unit: "/期",
      teachers: [
        { id: "lin", slots: { 6: ["13:00", "15:30"], 0: ["09:00", "13:00"] } },
        { id: "tan", slots: { 5: ["19:00"], 6: ["16:30"], 0: ["15:00"] } }
      ]
    },
    {
      id: "online", page: "online.html", name: "线上辅导", icon: "💻", color: "bg-white",
      tagline: "在家也能上课，课堂录像可回放，复习更方便。",
      highlights: ["Zoom 小班直播", "课堂录像 7 天回放", "电子练习卷自动批改", "家长端进度查看"],
      levels: ["primary", "secondary"],
      teachers: [
        { id: "lee",  slots: { 1: ["20:00"], 3: ["20:00"], 5: ["20:00"] } },
        { id: "zhou", slots: { 2: ["19:30"], 4: ["19:30"], 6: ["19:30"] } }
      ]
    }
  ]
};
