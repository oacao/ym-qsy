const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
  queueLimit: 0,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
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
                                             username VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
                                                  name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, 
                                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                  FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
    // 创建便签表
    await promisePool.query(`
    CREATE TABLE IF NOT EXISTS notes (
                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                         user_id INT NOT NULL,
                                         content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         FOREIGN KEY (user_id) REFERENCES users(id)
    )
`);
// 创建任务表
    await promisePool.query(`
        CREATE TABLE IF NOT EXISTS todos (
                                             id INT AUTO_INCREMENT PRIMARY KEY,
                                             user_id INT NOT NULL,
                                             title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                             priority INT DEFAULT 3,
                                             due_date DATETIME,
                                             completed BOOLEAN DEFAULT FALSE,
                                             tags TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                                             description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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

  // 更新正则表达式以允许中文字符
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(username)) {
    return res.status(400).json({ success: false, message: '用户名只能包含字母、数字和中文' });
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
  console.log('Received delete request for wallpaper with ID:', id); // 添加日志

  try {
    // 查询要删除的壁纸
    const [wallpapers] = await promisePool.query(
      'SELECT * FROM wallpapers WHERE id = ?',
      [id]
    );

    if (wallpapers.length === 0) {
      console.log('Wallpaper not found with ID:', id); // 添加日志
      return res.status(404).json({ success: false, message: '壁纸未找到' });
    }

    const wallpaper = wallpapers[0];

    // 删除数据库中的记录
    await promisePool.query(
      'DELETE FROM wallpapers WHERE id = ?',
      [id]
    );
    console.log('Wallpaper deleted from database:', wallpaper); // 添加日志

    // 删除文件系统中的图片文件
    const imagePath = path.join(__dirname, 'uploads', path.basename(wallpaper.url));
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
          return res.status(500).json({ success: false, message: '删除图片文件失败' });
        }
        console.log('Image file deleted:', imagePath);
        res.status(200).json({ success: true, message: '壁纸删除成功' });
      });
    } else {
      console.log('Image file does not exist:', imagePath);
      res.status(200).json({ success: true, message: '壁纸删除成功' });
    }
  } catch (error) {
    console.error('Error deleting wallpaper:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});
// 添加便签接口
app.post('/note', async (req, res) => {
  const { userId, content } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: '用户ID不能为空' });
  }

  try {
    const [result] = await promisePool.query(
      'INSERT INTO notes (user_id, content) VALUES (?, ?)',
      [userId, content || '']
    );

    const [newNote] = await promisePool.query(
      'SELECT * FROM notes WHERE id = ?',
      [result.insertId]
    );

    res.json({
      success: true,
      data: newNote[0]
    });
  } catch (error) {
    console.error('添加便签失败:', error);
    res.json({ success: false, message: '添加便签失败' });
  }
});

// 更新便签接口
app.put('/note/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    await promisePool.query(
      'UPDATE notes SET content = ? WHERE id = ?',
      [content, id]
    );

    const [updatedNote] = await promisePool.query(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedNote[0]
    });
  } catch (error) {
    console.error('更新便签失败:', error);
    res.json({ success: false, message: '更新便签失败' });
  }
});




// 获取便签列表接口
app.get('/notes/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, message: '用户ID不能为空' });
  }

  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取便签失败:', error);
    res.json({
      success: false,
      message: '获取便签失败'
    });
  }
});





// 删除便签接口
app.delete('/note/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await promisePool.query(
      'DELETE FROM notes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '便签未找到' });
    }

    res.json({ success: true, message: '便签删除成功' });
  } catch (error) {
    console.error('删除便签失败:', error);
    res.json({ success: false, message: '删除便签失败' });
  }
});

// 添加任务接口
app.post('/todo', async (req, res) => {
  const { userId, title, priority, dueDate, tags, description } = req.body;

  // 转换日期格式为MySQL datetime格式
  const formattedDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;

  try {
    const [result] = await promisePool.query(
      'INSERT INTO todos (user_id, title, priority, due_date, tags, description) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, priority, formattedDate, tags, description]
    );

    const [newTodo] = await promisePool.query(
      'SELECT * FROM todos WHERE id = ?',
      [result.insertId]
    );

    res.json({
      success: true,
      data: newTodo[0]
    });
  } catch (error) {
    console.error('添加任务失败:', error);
    res.status(500).json({
      success: false,
      message: '添加任务失败',
      error: error.message
    });
  }
});


// 获取任务列表
app.get('/todos/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.json({ success: false, message: '获取任务列表失败' });
  }
});


// 更新任务
app.put('/todo/:id', async (req, res) => {
  const { id } = req.params;
  const { title, priority, dueDate, completed, tags, description } = req.body;

  const formattedDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;

  try {
    await promisePool.query(
      'UPDATE todos SET title = ?, priority = ?, due_date = ?, completed = ?, tags = ?, description = ? WHERE id = ?',
      [title, priority, formattedDate, completed, JSON.stringify(tags), description, id]
    );

    const [updatedTodo] = await promisePool.query(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedTodo[0]
    });
  } catch (error) {
    console.error('更新任务失败:', error);
    res.json({ success: false, message: '更新任务失败' });
  }
});


// 删除任务
app.delete('/todo/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await promisePool.query('DELETE FROM todos WHERE id = ?', [id]);
    res.json({ success: true, message: '删除任务成功' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.json({ success: false, message: '删除任务失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
