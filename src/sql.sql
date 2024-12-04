CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增主键
                       username VARCHAR(255) NOT NULL UNIQUE,  -- 用户名，唯一且不能为空
                       password VARCHAR(255) NOT NULL  -- 密码，不能为空
);
