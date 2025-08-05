const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');  // <--- 加入 Nodemailer

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 建立 SQLite 資料庫
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('無法連接資料庫:', err.message);
  } else {
    console.log('已連接 SQLite 資料庫');
  }
});

// 建立表格
db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    country TEXT,
    spot TEXT,
    food TEXT,
    hotel TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// 提交資料並寄信
app.post('/submit', (req, res) => {
  const { email, country, spot, food, hotel } = req.body;

  if (!email || !country || !spot || !food || !hotel) {
    return res.status(400).json({ success: false, error: '缺少欄位' });
  }

  const stmt = db.prepare('INSERT INTO results (email, country, spot, food, hotel) VALUES (?, ?, ?, ?, ?)');
  stmt.run([email, country, spot, food, hotel], function (err) {
    if (err) {
      console.error('儲存錯誤:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    // 寄信設定
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'richardliou0429@gmail.com', // 寄件Gmail
        pass: 'yvekjeqvcztqdsdk'          // 應用程式密碼
      }
    });

    const mailOptions = {
      from: 'richardliou0429@gmail.com', // 與上面相同
      to: email,
      subject: '感謝您填寫旅遊問卷',
      text: `您好，感謝您填寫旅遊問卷！以下是您提交的資訊：

- 國家：${country}
- 景點：${spot}
- 美食：${food}
- 住宿：${hotel}

我們將以此作為推薦依據，祝您有愉快的旅程！`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('寄信失敗:', error.message);
        // 寄信失敗不影響主流程
      } else {
        console.log('已寄信給：' + email);
      }
    });

    res.json({ success: true, id: this.lastID });
  });

  stmt.finalize();
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器啟動：http://localhost:${port}`);
});
