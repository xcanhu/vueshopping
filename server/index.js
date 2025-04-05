const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderToString } = require('@vue/server-renderer');

let manifest = {};
try {
  manifest = require('../dist/ssr-manifest.json');
} catch (error) {
  console.log('SSR manifest not found, running in non-SSR mode');
}

const server = express();

// 静态资源服务
server.use('/assets', express.static(path.join(__dirname, '../dist/assets')));
server.use('/favicon.svg', express.static(path.join(__dirname, '../dist/favicon.svg')));

// API路由
server.get('/api/products', (req, res) => {
  // 获取查询参数
  const { page = 1, pageSize = 12, category, search, tag, sort } = req.query;
  
  // 模拟产品数据
  const allProducts = [
    {
      id: 1,
      title: 'iPhone 16 Pro',
      price: 8999,
      description: '最新款iPhone，搭载A15仿生芯片',
      category: '手机数码',
      image: 'https://img.alicdn.com/imgextra/i2/4129257698/O1CN01cGe2lN26jjty4GaoS_!!4129257698.jpg_q50.jpg_.webp',
      rating: {
        rate: 4.8,
        count: 320
      },
      stock: 100,
      isNew: true,
      discount: 0,
      tags: ['新品', '热卖', '高端']
    },
    {
      id: 2,
      title: 'MacBook Pro 14英寸',
      price: 14999,
      description: '搭载M1 Pro芯片，强大性能',
      category: '电脑办公',
      image: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spaceblack-gallery1-202410?wid=4000&hei=3074&fmt=jpeg&qlt=90&.v=1729264981617',
      rating: {
        rate: 4.9,
        count: 156
      },
      stock: 50,
      isNew: true,
      discount: 0,
      tags: ['新品', '高端']
    },
    {
      id: 3,
      title: '华为 Mate 50 Pro',
      price: 6999,
      description: '搭载麒麟9000处理器，徕卡影像系统',
      category: '手机数码',
      image: 'https://img.alicdn.com/imgextra/i3/14770107/O1CN01fOdenS1Cf3Q1Qnlnq_!!14770107.jpg_.webp',
      rating: {
        rate: 4.7,
        count: 245
      },
      stock: 80,
      isNew: false,
      discount: 0.1,
      tags: ['热卖', '促销']
    },
    {
      id: 4,
      title: '小米电视6 OLED 65英寸',
      price: 7999,
      description: '4K超高清OLED屏幕，杜比视界',
      category: '家用电器',
      image: 'https://cdn.cnbj0.fds.api.mi-img.com/b2c-shopapi-pms/pms_1728975011.67952227.jpg',
      rating: {
        rate: 4.6,
        count: 189
      },
      stock: 30,
      isNew: true,
      discount: 0,
      tags: ['新品', '限量版']
    },
    {
      id: 5,
      title: 'NIKE Air Jordan 1',
      price: 1299,
      description: '经典篮球鞋，舒适耐穿',
      category: '服装鞋包',
      image: 'https://img.alicdn.com/imgextra/i2/4129257698/O1CN01cGe2lN26jjty4GaoS_!!4129257698.jpg_q50.jpg_.webp',
      rating: {
        rate: 4.9,
        count: 520
      },
      stock: 10,
      isNew: false,
      discount: 0,
      tags: ['热卖', '限量版']
    },
    {
      id: 6,
      title: 'SK-II 神仙水 230ml',
      price: 1599,
      description: '明星产品，改善肤质',
      category: '美妆护肤',
      image: 'https://gw.alicdn.com/imgextra/O1CN01Xxhd4P1UqC41NNRUB_!!379092568.jpg_.webp',
      rating: {
        rate: 4.8,
        count: 432
      },
      stock: 60,
      isNew: false,
      discount: 0.15,
      tags: ['热卖', '促销']
    },
    {
      id: 7,
      title: '三只松鼠坚果礼盒',
      price: 199,
      description: '多种坚果组合，送礼佳品',
      category: '食品生鲜',
      image: 'https://img.alicdn.com/imgextra/i3/2217592119216/O1CN01p440sb2Hwz9BFUxxN_!!2217592119216.png_.webp',
      rating: {
        rate: 4.5,
        count: 678
      },
      stock: 200,
      isNew: false,
      discount: 0.2,
      tags: ['促销']
    },
    {
      id: 8,
      title: '《人类简史》',
      price: 59,
      description: '尤瓦尔·赫拉利代表作，全球畅销书',
      category: '图书音像',
      image: 'https://img.alicdn.com/imgextra/i3/133668489/O1CN01n7lnze2Ca1FM5wqFZ_!!4611686018427387529-0-item_pic.jpg_.webp',
      rating: {
        rate: 4.9,
        count: 1024
      },
      stock: 150,
      isNew: false,
      discount: 0,
      tags: ['热卖']
    },
    {
      id: 9,
      title: '小米手环7',
      price: 249,
      description: '全天候健康监测，长续航',
      category: '手机数码',
      image: 'https://img.alicdn.com/imgextra/i1/2207440821122/O1CN01NyIOKO1K9vQfVTGKJ_!!4611686018427386754-0-item_pic.jpg_.webp',
      rating: {
        rate: 4.6,
        count: 356
      },
      stock: 120,
      isNew: true,
      discount: 0.1,
      tags: ['新品', '促销']
    },
    {
      id: 10,
      title: 'SONY WH-1000XM4 耳机',
      price: 2299,
      description: '业界领先降噪，高解析音质',
      category: '手机数码',
      image: 'https://gw.alicdn.com/imgextra/O1CN01Nft0L022C4NSIlhpR_!!370627083.jpg_.webp',
      rating: {
        rate: 4.9,
        count: 278
      },
      stock: 45,
      isNew: false,
      discount: 0,
      tags: ['高端', '热卖']
    },
    {
      id: 11,
      title: '戴森吸尘器 V11',
      price: 4290,
      description: '强劲吸力，智能感应清洁',
      category: '家用电器',
      image: 'https://img.alicdn.com/imgextra/i4/859230932/O1CN01ifof1T1IkuBAEO1pf_!!4611686018427384532-0-item_pic.jpg_.webp',
      rating: {
        rate: 4.7,
        count: 198
      },
      stock: 30,
      isNew: false,
      discount: 0.05,
      tags: ['高端', '促销']
    },
    {
      id: 12,
      title: '安踏运动鞋',
      price: 399,
      description: '轻便透气，舒适耐穿',
      category: '服装鞋包',
      image: 'https://img.alicdn.com/imgextra/i1/2955374408/O1CN01zlqZrX1iQutzmbo2p_!!4611686018427383624-0-item_pic.jpg_.webp',
      rating: {
        rate: 4.5,
        count: 456
      },
      stock: 200,
      isNew: false,
      discount: 0.3,
      tags: ['促销']
    }
  ];
  
  // 筛选商品
  let filteredProducts = [...allProducts];
  
  // 按分类筛选
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  // 按搜索关键词筛选
  if (search) {
    const keyword = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(keyword) || 
      p.description.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword)
    );
  }
  
  // 按标签筛选
  if (tag) {
    filteredProducts = filteredProducts.filter(p => p.tags && p.tags.includes(tag));
  }
  
  // 排序
  if (sort) {
    if (sort === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating-desc') {
      filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
    } else if (sort === 'newest') {
      filteredProducts = filteredProducts.filter(p => p.isNew).concat(filteredProducts.filter(p => !p.isNew));
    }
  }
  
  // 分页
  const pageNum = parseInt(page);
  const pageSizeNum = parseInt(pageSize);
  const startIndex = (pageNum - 1) * pageSizeNum;
  const endIndex = startIndex + pageSizeNum;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: Math.ceil(filteredProducts.length / pageSizeNum)
  });
});

// 用户登录API
server.post('/api/login', express.json(), (req, res) => {
  const { username, password } = req.body;
  
  // 简单的用户验证逻辑
  if (username === 'admin' && password === 'password') {
    res.json({
      token: 'mock-jwt-token',
      userInfo: {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        email: 'admin@example.com',
        avatar: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.jHUH4s7TQ48X_B-1iozuJgHaHa?rs=1&pid=ImgDetMain',
        role: 'admin',
        createTime: new Date().toISOString()
      }
    });
  } else {
    res.status(401).json({
      message: '用户名或密码错误'
    });
  }
});

// SSR处理
server.get('*', async (req, res) => {
  try {
    // 检查是否存在SSR构建文件
    const ssrDistPath = path.join(__dirname, '../dist/index.html');
    const ssrServerPath = path.join(__dirname, '../dist/server/entry-server.js');
    
    if (fs.existsSync(ssrDistPath) && fs.existsSync(ssrServerPath)) {
      // SSR模式
      const template = fs.readFileSync(ssrDistPath, 'utf-8');
      const { render } = require(ssrServerPath);
      
      // 渲染应用
      const { html: appHtml, preloadLinks } = await render(req.url, manifest);
      
      // 注入渲染后的应用内容到HTML模板
      const html = template
        .replace('<!--preload-links-->', preloadLinks)
        .replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } else {
      // 非SSR模式，返回简单的HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vue电商网站 API服务器</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #42b883; }
            ul { padding-left: 20px; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Vue电商网站 API服务器</h1>
            <p>API服务器已成功启动。可用的API端点：</p>
            <ul>
              <li><code>GET /api/products</code> - 获取商品列表</li>
              <li><code>POST /api/login</code> - 用户登录</li>
            </ul>
          </div>
        </body>
        </html>
      `);
    }
  } catch (e) {
    console.log(e.stack);
    res.status(500).end('Internal Server Error');
  }
});

// 启动服务器
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});