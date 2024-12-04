const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
const saltRounds = 10;

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '13110142654a',
  database: 'mysql',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const corsOptions = {
  origin: 'http://localhost:5588',
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// 初始化数据库
const initDatabase = async () => {
  try {
    // 创建用户表
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建壁纸表
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS wallpapers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        url VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化出错:', error);
  }
};

// 连接数据库
pool.getConnection((err, connection) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('数据库连接成功');
  connection.release();
  initDatabase();
});

// 注册接口
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await promisePool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.json({
      success: true,
      data: {
        id: result.insertId,
        username: username,
        token: 'mock-token-' + username
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.json({ success: false, message: '用户名已存在' });
    } else {
      res.json({ success: false, message: '注册失败' });
    }
  }
});

// 登录接口
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length > 0) {
      const match = await bcrypt.compare(password, rows[0].password);
      if (match) {
        res.json({
          success: true,
          data: {
            id: rows[0].id,
            username: rows[0].username,
            token: 'mock-token-' + username
          }
        });
      } else {
        res.json({
          success: false,
          message: '用户名或密码错误'
        });
      }
    } else {
      res.json({
        success: false,
        message: '用户不存在'
      });
    }
  } catch (error) {
    console.error('登录错误:', error);
    res.json({ success: false, message: '登录失败' });
  }
});

// 文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有文件上传' });
  }
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// 添加壁纸接口
app.post('/wallpaper', async (req, res) => {
  const { userId, url, name } = req.body;
  console.log('收到添加壁纸请求:', { userId, url, name });

  if (!userId || !url || !name) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }

  try {
    // 验证用户是否存在
    const [users] = await promisePool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    // 插入壁纸记录
    const [result] = await promisePool.query(
      'INSERT INTO wallpapers (user_id, url, name) VALUES (?, ?, ?)',
      [userId, url, name]
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('添加壁纸失败:', error);
    res.json({
      success: false,
      message: error.message || '添加壁纸失败'
    });
  }
});

// 获取壁纸列表接口
app.get('/wallpapers/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, message: '用户ID不能为空' });
  }

  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM wallpapers WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取壁纸列表失败:', error);
    res.json({
      success: false,
      message: '获取壁纸列表失败'
    });
  }
});
// 删除壁纸接口
app.delete('/wallpaper/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await promisePool.query('DELETE FROM wallpapers WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: '删除失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
