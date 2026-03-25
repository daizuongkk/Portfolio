const config = {
  title: "DAIZUONGKK | Full-Stack Developer",
  description: {
    long: "Khám phá danh mục đầu tư của daizuongkk, một nhà phát triển toàn diện và nhà công nghệ sáng tạo chuyên về trải nghiệm web tương tác, hoạt ảnh 3D và các dự án sáng tạo. Khám phá tác phẩm mới nhất của tôi. Hãy cùng nhau xây dựng một điều gì đó tuyệt vời!",
    short:
      "Khám phá danh mục đầu tư của Daizuongkk, một nhà phát triển toàn diện tạo ra trải nghiệm web tương tác và các dự án sáng tạo.",
  },
  keywords: [
    "daizuongkk",
    "portfolio",
    "full-stack developer",
    "creative technologist",
    "web development",
    "3D animations",
    "interactive websites",
    "Đại Nguyễn",

    "web design",
    "GSAP",
    "React",
    "Next.js",
    "Spline",
  ],
  author: "Trong Dai Nguyen",
  email: "trongdaidt147@gmail.com",
  site: "",
  // site: "https://nareshkhatri.site",

  // for github stars button
  githubUsername: "daizuongkk",
  githubRepo: "daitodo",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "https://x.com/daizuongkk",
    linkedin: "https://www.linkedin.com/in/daizuongkk/",
    instagram: "https://www.instagram.com/daizuongkk",
    facebook: "https://www.facebook.com/daizuongkk/",
    github: "https://github.com/daizuongkk",
  },
};
export { config };
