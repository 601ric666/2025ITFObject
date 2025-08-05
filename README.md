<!--啟動伺服器-->
node server.js

<!--刪除並重置資料，於DB BROWSER，執行SQL中執行-->
DELETE FROM results;
DELETE FROM sqlite_sequence WHERE name='results';